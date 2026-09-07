from datetime import datetime

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_smorest import abort
from flask_smorest.blueprint import Blueprint
from flask_smorest.pagination import PaginationParameters
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import joinedload

from src.extensions import db
from src.modules.auth.decorators import role_required
from src.modules.auth.enums import UserRole
from src.modules.auth.models import User

from .enums import JobPostStatus
from .models import JobPost
from .schemas import JobPostRequest, JobPostResponse

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
        ]
    )
    
    if job is None:
        abort(404, message="Bài đăng không tồn tại")
        
    return job