from datetime import datetime

from flask_jwt_extended import get_jwt_identity
from flask_smorest.blueprint import Blueprint
from flask_smorest.pagination import PaginationParameters
from sqlalchemy import func, select

from src.extensions import db
from src.modules.auth.decorators import role_required
from src.modules.auth.enums import UserRole

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
def get_latest_jobs():
    """
    Lấy 20 bài tuyển dụng mới nhất
    """

    stmt = (
        select(JobPost)
        .order_by(JobPost.id.desc())
        .limit(20)
        .where(
            JobPost.status == JobPostStatus.ACTIVE, JobPost.deadline >= datetime.now()
        )
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
