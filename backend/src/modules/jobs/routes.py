from flask_smorest import Blueprint
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from src.extensions import db

from .models import JobPost

jobs_bp = Blueprint(
    "jobs",
    "jobs",
    url_prefix="/api/jobs",
    description="Các thao tác quản lý Việc làm",
)


@jobs_bp.route("/latest", methods=["GET"])
@jobs_bp.response(200, description="Lấy danh sách việc làm mới nhất")
def get_latest_jobs():
    """
    Lấy 10 bài tuyển dụng mới nhất
    """
    stmt = (
        select(JobPost)
        .options(joinedload(JobPost.employer))
        .order_by(JobPost.id.desc())
        .limit(10)
    )
    jobs = db.session.scalars(stmt).all()

    result = []
    for job in jobs:
        # Ưu tiên lấy company_name của nhà tuyển dụng, nếu không có thì lấy full_name
        company_name = (
            job.employer.company_name
            if job.employer and job.employer.company_name
            else (job.employer.full_name if job.employer else "Công ty Tuyển dụng")
        )

        result.append({
            "id": job.id,
            "title": job.title,
            "company_name": company_name,
            "location": job.location,
            "salary": job.salary_range or "Thỏa thuận",
            "created_at": job.created_at.isoformat() if job.created_at else None,
        })

    return result, 200