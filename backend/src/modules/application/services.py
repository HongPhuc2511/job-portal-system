from sqlalchemy import update

from src.extensions import db

from .enums import ApplicationStatus
from .models import Application


def reject_pending_applications(job_post_id: int) -> int:
    """
    Chuyển toàn bộ hồ sơ đang chờ của một bài đăng sang 'Từ chối'.
    Trả về số hồ sơ vừa cập nhật (dùng khi employer đóng bài đăng).
    """
    result = db.session.execute(
        update(Application)
        .where(
            Application.job_post_id == job_post_id,
            Application.status == ApplicationStatus.PENDING,
        )
        .values(status=ApplicationStatus.REJECTED)
    )
    return result.rowcount or 0  # ty: ignore[unresolved-attribute]
