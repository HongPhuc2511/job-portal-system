from flask import abort
from flask_jwt_extended import get_jwt_identity
from flask_smorest.blueprint import Blueprint
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from src.extensions import db
from src.modules.application.models import Application
from src.modules.application.schemas import (
    ApplicationResponse,
    ApplicationStatusUpdateRequest,
)
from src.modules.auth.decorators import role_required
from src.modules.auth.enums import UserRole
from src.modules.posts.models import JobPost

applications_bp = Blueprint(
    "applications",
    "applications",
    url_prefix="/api/applications",
    description="Quản lý hồ sơ ứng tuyển",
)


@applications_bp.route("", methods=["GET"])
@role_required(UserRole.SEEKER)
@applications_bp.response(200, schema=ApplicationResponse(many=True))
def get_my_applications():
    """
    Ứng viên xem danh sách các công việc đã ứng tuyển
    """
    candidate_id = int(get_jwt_identity())

    stmt = (
        select(Application)
        .options(
            joinedload(Application.job_post).joinedload(JobPost.employer),
            joinedload(Application.job_post).joinedload(JobPost.province),
            joinedload(Application.job_post).joinedload(JobPost.district),
            joinedload(Application.resume),
        )
        .where(Application.candidate_id == candidate_id)
        .order_by(Application.created_at.desc())
    )

    return db.session.scalars(stmt).all()


@applications_bp.route("/<int:application_id>/status", methods=["PATCH"])
@role_required(UserRole.EMPLOYER)
@applications_bp.arguments(ApplicationStatusUpdateRequest)
@applications_bp.response(200, schema=ApplicationResponse)
def update_application_status(data, application_id: int):
    """
    Nhà tuyển dụng cập nhật trạng thái xử lý hồ sơ
    (pending / approved / rejected) — sau này gắn thông báo cho ứng viên tại đây
    """
    employer_id = int(get_jwt_identity())
    application = db.session.get(
        Application,
        application_id,
        options=[
            joinedload(Application.candidate),
            joinedload(Application.resume),
            joinedload(Application.job_post),
        ],
    )
    if application is None:
        abort(404, message="Hồ sơ không tồn tại")

    if application.job_post.employer_id != employer_id:
        abort(403, message="Bạn không có quyền cập nhật hồ sơ này")

    application.status = data["status"]
    db.session.commit()
    return application
