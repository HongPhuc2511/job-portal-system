from flask import current_app
from flask_mail import Message
from sqlalchemy import func, select, update

from src.extensions import db, mail

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
    return result.rowcount or 0  # type: ignore


def attach_application_stats(posts) -> None:
    """
    Gắn số lượng hồ sơ ứng tuyển (tổng + theo trạng thái) vào từng bài đăng
    trong danh sách qua thuộc tính `application_stats` (in-place).

    Dùng 1 câu aggregate GROUP BY cho cả list để tránh N+1 query.
    """
    if not posts:
        return

    post_ids = {post.id for post in posts}
    rows = db.session.execute(
        select(
            Application.job_post_id,
            Application.status,
            func.count(Application.id),
        )
        .where(Application.job_post_id.in_(post_ids))
        .group_by(Application.job_post_id, Application.status)
    ).all()

    stats_by_post: dict[int, dict[str, int]] = {
        post_id: {"total": 0, "pending": 0, "approved": 0, "rejected": 0}
        for post_id in post_ids
    }
    for post_id, status, count in rows:
        stats_by_post[post_id][status.value] += count
        stats_by_post[post_id]["total"] += count

    for post in posts:
        post.application_stats = stats_by_post[post.id]

def send_new_application_email(application: Application) -> None:
    """Gửi email báo nhà tuyển dụng có ứng viên mới nộp hồ sơ."""
    employer = application.job_post.employer
    msg = Message(
        subject=f"[JobPortal] Ung vien moi cho tin '{application.job_post.title}'",
        recipients=[employer.email],
        body=(
            f"Xin chao {employer.full_name},\n\n"
            f"Ung vien {application.candidate.full_name} vua nop ho so ung tuyen "
            f"vao tin '{application.job_post.title}' cua ban.\n"
            f"Vui long dang nhap he thong de xem chi tiet va duyet ho so.\n\n"
            f"Tran trong,\nJobPortal"
        ),
    )
    try:
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Loi gui email ung vien moi: {e}")