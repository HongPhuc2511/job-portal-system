from src.modules.application.services import reject_pending_applications
from datetime import datetime

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_smorest import abort
from flask_smorest.blueprint import Blueprint
from flask_smorest.pagination import PaginationParameters
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import joinedload

from src.extensions import db
from src.modules.application.enums import ApplicationStatus
from src.modules.application.models import Application
from src.modules.application.schemas import JobPostApplicationResponse
from src.modules.auth.decorators import role_required
from src.modules.auth.enums import UserRole
from src.modules.auth.models import User
from src.modules.resume.models import Resume

from .enums import JobPostStatus
from .models import JobPost
from .schemas import (
    ApplyJobRequest,
    EmployerDashboardResponse,
    JobPostRequest,
    JobPostResponse,
    JobPostStatusUpdateRequest,
)

job_posts_bp = Blueprint(
    "job-posts",
    "job-posts",
    url_prefix="/api/posts",
    description="Các thao tác lên bài đăng tuyển dụng",
)


@job_posts_bp.route("/", methods=["GET"])
@job_posts_bp.response(200, schema=JobPostResponse(many=True))
@job_posts_bp.paginate()
def get_latest_jobs(pagination_parameters: PaginationParameters):
    """
    Lấy các bài tuyển dụng mới nhất (Có hỗ trợ lọc theo tiêu chí và tìm kiếm từ khoá)
    """
    keyword = (request.args.get("keyword") or "").strip()
    province_id = request.args.get("province_id", type=int)
    job_type = request.args.get("job_type", type=str)
    salary = request.args.get("salary", type=int)

    filters = [
        JobPost.status == JobPostStatus.ACTIVE,
        JobPost.deadline >= datetime.now(),
    ]

    if keyword:
        pattern = f"%{keyword}%"
        filters.append(
            or_(
                JobPost.title.ilike(pattern),
                JobPost.description.ilike(pattern),
                JobPost.employer.has(User.company_name.ilike(pattern)),
            )
        )

    if province_id:
        filters.append(JobPost.province_id == province_id)

    if job_type:
        filters.append(JobPost.job_type == job_type)

    if salary:
        filters.append(
            or_(
                and_(salary >= JobPost.salary_min, salary <= JobPost.salary_max),
                and_(JobPost.salary_max.is_(None), JobPost.salary_min.is_(None)),
            )
        )

    pagination_parameters.item_count = db.session.scalar(
        select(func.count(JobPost.id)).where(*filters)
    )

    stmt = (
        select(JobPost)
        .options(
            joinedload(JobPost.province),
            joinedload(JobPost.district),
            joinedload(JobPost.employer),
        )
        .where(*filters)
        .order_by(JobPost.id.desc())
        .offset(pagination_parameters.first_item)
        .limit(pagination_parameters.page_size)
    )
    return db.session.scalars(stmt).all()


@job_posts_bp.route("/employer/<int:employer_id>", methods=["GET"])
@job_posts_bp.response(200, schema=JobPostResponse(many=True))
@job_posts_bp.paginate()
def get_employer_posts(employer_id: int, pagination_parameters: PaginationParameters):
    pagination_parameters.item_count = db.session.scalar(
        select(func.count(JobPost.id)).where(JobPost.employer_id == employer_id)
    )

    stmt = (
        select(JobPost)
        .options(
            joinedload(JobPost.province),
            joinedload(JobPost.district),
            joinedload(JobPost.employer),
        )
        .where(JobPost.employer_id == employer_id)
        .order_by(JobPost.id.desc())
        .offset(pagination_parameters.first_item)
        .limit(pagination_parameters.page_size)
    )
    return db.session.scalars(stmt).all()


@job_posts_bp.route("/", methods=["POST"])
@job_posts_bp.arguments(JobPostRequest)
@role_required(UserRole.EMPLOYER)
@job_posts_bp.response(201, schema=JobPostResponse)
def create_job_post(data):
    """
    Tạo mới một bài đăng tuyển dụng
    """
    job = JobPost(**data, employer_id=int(get_jwt_identity()))
    db.session.add(job)
    db.session.commit()
    return job


@job_posts_bp.route("/<int:post_id>", methods=["PUT"])
@job_posts_bp.arguments(JobPostRequest)
@role_required(UserRole.EMPLOYER)
@job_posts_bp.response(200, schema=JobPostResponse)
def update_job_post(data, post_id: int):
    """
    Cập nhật một bài đăng tuyển dụng (chỉ nhà tuyển dụng sở hữu bài đăng)
    """
    job = db.session.get(JobPost, post_id)
    if job is None:
        abort(404, message="Bài đăng không tồn tại")
    if job.employer_id != int(get_jwt_identity()):
        abort(403, message="Bạn không có quyền sửa bài đăng này")

    for field, value in data.items():
        setattr(job, field, value)
    db.session.commit()
    return job


@job_posts_bp.route("/<int:post_id>", methods=["DELETE"])
@role_required(UserRole.EMPLOYER)
@job_posts_bp.response(200, description="Xóa bài đăng thành công")
def delete_job_post(post_id: int):
    job = db.session.get(JobPost, post_id)
    if job is None:
        abort(404, message="Bài đăng không tồn tại")
    if job.employer_id != int(get_jwt_identity()):
        abort(403, message="Bạn không có quyền xóa bài đăng này")

    db.session.delete(job)
    db.session.commit()
    return {"message": "Xóa bài đăng thành công"}


@job_posts_bp.route("/<int:post_id>", methods=["GET"])
@job_posts_bp.response(200, schema=JobPostResponse)
def get_job_post(post_id: int):
    """
    Xem thông tin chi tiết của một bài đăng tuyển dụng (Public)
    """
    job = db.session.get(
        JobPost,
        post_id,
        options=[
            joinedload(JobPost.province),
            joinedload(JobPost.district),
            joinedload(JobPost.employer),
        ],
    )

    if job is None:
        abort(404, message="Bài đăng không tồn tại")

    return job


@job_posts_bp.route("/<int:post_id>/applications", methods=["GET"])
@role_required(UserRole.EMPLOYER)
@job_posts_bp.response(200, schema=JobPostApplicationResponse(many=True))
def list_post_applications(post_id: int):
    """
    Nhà tuyển dụng xem danh sách hồ sơ ứng tuyển của một bài đăng
    """
    employer_id = int(get_jwt_identity())

    job = db.session.get(JobPost, post_id)
    if job is None:
        abort(404, message="Bài đăng không tồn tại")
    if job.employer_id != employer_id:
        abort(403, message="Bạn không có quyền xem hồ sơ của bài đăng này")

    status_value = request.args.get("status", type=str)
    filters = [Application.job_post_id == post_id]
    if status_value:
        if status_value not in {s.value for s in ApplicationStatus}:
            abort(400, message="Trạng thái hồ sơ không hợp lệ")
        filters.append(Application.status == ApplicationStatus(status_value))

    stmt = (
        select(Application)
        .options(
            joinedload(Application.candidate),
            joinedload(Application.resume),
        )
        .where(*filters)
        .order_by(Application.created_at.desc())
    )
    return db.session.scalars(stmt).all()


@job_posts_bp.route("/dashboard", methods=["GET"])
@role_required(UserRole.EMPLOYER)
@job_posts_bp.response(200, schema=EmployerDashboardResponse)
def get_employer_dashboard():
    """Tổng quan dashboard của nhà tuyển dụng"""
    employer_id = int(get_jwt_identity())

    total_posts = db.session.scalar(
        select(func.count(JobPost.id)).where(JobPost.employer_id == employer_id)
    )

    active_posts = db.session.scalar(
        select(func.count(JobPost.id)).where(
            JobPost.employer_id == employer_id,
            JobPost.status == JobPostStatus.ACTIVE,
        )
    )

    total_applications = db.session.scalar(
        select(func.count(Application.id))
        .join(JobPost, Application.job_post_id == JobPost.id)
        .where(JobPost.employer_id == employer_id)
    )

    pending_applications = db.session.scalar(
        select(func.count(Application.id))
        .join(JobPost, Application.job_post_id == JobPost.id)
        .where(
            JobPost.employer_id == employer_id,
            Application.status == ApplicationStatus.PENDING,
        )
    )

    return {
        "total_posts": total_posts,
        "active_posts": active_posts,
        "total_applications": total_applications,
        "pending_applications": pending_applications,
    }


@job_posts_bp.route("/<int:post_id>/apply", methods=["POST"])
@role_required(UserRole.SEEKER)
@job_posts_bp.arguments(ApplyJobRequest)
@job_posts_bp.response(201, description="Ứng tuyển thành công")
def apply_job(data, post_id: int):
    """
    Ứng viên nộp CV vào một bài đăng tuyển dụng
    """
    candidate_id = int(get_jwt_identity())

    job = db.session.get(JobPost, post_id)
    if job is None or job.status != JobPostStatus.ACTIVE:
        abort(404, message="Tin tuyển dụng không tồn tại hoặc đã đóng!")

    resume = db.session.get(Resume, data["resume_id"])
    if resume is None or resume.user_id != candidate_id:
        abort(403, message="CV không hợp lệ hoặc không thuộc quyền sở hữu của bạn!")

    existing_app = db.session.scalars(
        select(Application).where(
            Application.candidate_id == candidate_id, Application.job_post_id == post_id
        )
    ).first()

    if existing_app:
        abort(
            400, message="Bạn đã nộp hồ sơ vào vị trí này rồi. Vui lòng chờ phản hồi!"
        )

    application = Application(
        candidate_id=candidate_id,
        job_post_id=post_id,
        resume_id=data["resume_id"],
        cover_letter=data.get("cover_letter"),
        status=ApplicationStatus.PENDING,
    )
    db.session.add(application)
    db.session.commit()

    return {"message": "Ứng tuyển thành công"}


@job_posts_bp.route("/<int:post_id>/status", methods=["PATCH"])
@job_posts_bp.arguments(JobPostStatusUpdateRequest)
@role_required(UserRole.EMPLOYER)
@job_posts_bp.response(200, schema=JobPostResponse)
def update_job_post_status(data, post_id: int):
    """
    Đóng / mở lại bài đăng tuyển dụng.
    Khi đóng bài đăng, toàn bộ hồ sơ đang chờ tự chuyển sang 'Từ chối'.
    """
    job = db.session.get(JobPost, post_id)
    if job is None:
        abort(404, message="Bài đăng không tồn tại")
    if job.employer_id != int(get_jwt_identity()):
        abort(403, message="Bạn không có quyền sửa bài đăng này")

    job.status = data["status"]
    if data["status"] == JobPostStatus.CLOSED:
        reject_pending_applications(job.id)
    db.session.commit()
    return job
