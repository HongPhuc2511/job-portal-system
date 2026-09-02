import os
import uuid

from flask import request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import Blueprint
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from src.extensions import db

from .models import JobPost,Resume
from .schemas import ResumeResponse

jobs_bp = Blueprint(
    "jobs",
    "jobs",
    url_prefix="/api/jobs",
    description="Các thao tác quản lý Việc làm",
)


@jobs_bp.route("/latest", methods=["GET"])
@jobs_bp.response(200, description="Lấy danh sách việc làm mới nhất")
def get_latest_jobs():
    """Lấy 10 bài tuyển dụng mới nhất"""
    stmt = (
        select(JobPost)
        .options(joinedload(JobPost.employer))
        .order_by(JobPost.id.desc())
        .limit(10)
    )
    jobs = db.session.scalars(stmt).all()

    result = []
    for job in jobs:
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

resumes_bp = Blueprint(
    "resumes",
    "resumes",
    url_prefix="/api/resumes",
    description="Quan ly CV cua ung vien",
)


@resumes_bp.route("", methods=["POST"])
@jwt_required()
@resumes_bp.response(201, schema=ResumeResponse, description="Tao CV thanh cong")
def create_resume():
    """Ứng vien tạo CV mới (upload file PDF)"""
    user_id = get_jwt_identity()
    file = request.files["file"]
    title = request.form.get("title")

    filename = f"{uuid.uuid4().hex}_{file.filename}"
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))

    new_resume = Resume(user_id=user_id, title=title, file_path=filename)
    db.session.add(new_resume)
    db.session.commit()

    return new_resume

@resumes_bp.route("", methods=["GET"])
@jwt_required()
@resumes_bp.response(200, schema=ResumeResponse(many=True), description="Danh sach CV cua ung vien")
def list_resumes():
    """Ứng viên xem CV của chính mình"""
    user_id = get_jwt_identity()
    stmt=select(Resume).where(Resume.user_id == user_id).order_by(Resume.created_at.desc())
    return db.session.scalars(stmt).all()