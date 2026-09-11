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
            f"Xin chào {employer.full_name},\n\n"
            f"Ứng viên {application.candidate.full_name} vừa nộp hồ sơ ứng tuyển "
            f"vào tin '{application.job_post.title}' của bạn.\n"
            f"Vui lòng đăng nhập hệ thống để xem chi tiết hồ sơ.\n\n"
            f"Trân trọng,\nJobPortal"
        ),
    )
    try:
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Lời gửi email ứng viên mới: {e}")

def send_application_status_email(application: Application) -> None:
    """Gửi email báo ứng viên ket quả duyệt hồ sơ"""
    status_text = {
        ApplicationStatus.APPROVED: "Được chấp nhận",
        ApplicationStatus.REJECTED: "Không phù hợp voi vị trí này",
    }.get(application.status, application.status.value)

    candidate = application.candidate
    msg = Message(
        subject=f"[JobPortal] Cập nhật hồ sơ ứng tuyển '{application.job_post.title}'",
        recipients=[candidate.email],
        body=(
            f"Xin chào {candidate.full_name},\n\n"
            f"Hồ sơ của bạn ứng tuyển vào tin '{application.job_post.title}' {status_text}.\n"
            f"Vui lòng đăng nhập để xem chi tiết.\n\n"
            f"Tran trọng,\nJobPortal"
        ),
    )
    try:
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Lời gửi email cap nhat trang thai: {e}")

    # #Hướng dẫn tích hợp email
    # 1. Tải file requirements.txt
    # 2. Dô gg bật Xác minh 2 bước
    # 3. Nếu xác minh rồi th dô App Password tạo và lấy chuỗi 16 ký tự
    # 4. Vào file .env thêm 2 biến sau
    # MAIL_USERNAME = email dùng để test
    # MAIL_PASSWORD = mã 16 ký tự vừa lấy