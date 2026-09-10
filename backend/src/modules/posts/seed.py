import json
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy import func, select

from src import create_app
from src.extensions import db
from src.modules.application.enums import ApplicationStatus
from src.modules.application.models import Application
from src.modules.auth.enums import UserRole
from src.modules.auth.models import User
from src.modules.location import District, Province
from src.modules.posts.enums import (
    ExperienceLevel,
    JobType,
    SalaryPeriod,
    WorkModel,
)
from src.modules.posts.models import JobPost
from src.modules.resume.enums import ResumeType
from src.modules.resume.models import Resume

SEED_DATA_PATH = Path(__file__).parent / "seed_data.json"
DEFAULT_PASSWORD = "123456"


def _find_province_and_district(
    province_name: str, district_name: str, title: str
) -> tuple[Province, District]:
    province = db.session.scalars(
        select(Province).where(Province.name == province_name)
    ).one_or_none()
    district = None
    if province is not None:
        district = db.session.scalars(
            select(District).where(
                District.province_id == province.id,
                District.name == district_name,
            )
        ).one_or_none()
    if province is None or district is None:
        raise ValueError(
            f"Không tìm thấy '{province_name}' / '{district_name}' "
            f"cho bài đăng '{title}' — hãy chạy python -m src.modules.location.seed trước"
        )
    return province, district


def seed() -> tuple[int, int, int, int]:
    """
    Seed người dùng, bài đăng, CV của ứng viên và đơn ứng tuyển cho database.
    Cách chạy:

    ```bash
    python -m src.modules.posts.seed
    ```
    """
    with open(SEED_DATA_PATH, encoding="utf-8") as f:
        data = json.load(f)

    existing_emails = set(db.session.scalars(select(User.email)))
    existing_post_keys = {
        (employer_id, title)
        for employer_id, title in db.session.execute(
            select(JobPost.employer_id, JobPost.title)
        ).all()
    }
    existing_resume_keys = {
        (user_id, title)
        for user_id, title in db.session.execute(
            select(Resume.user_id, Resume.title)
        ).all()
    }
    existing_application_keys = {
        (candidate_id, job_post_id)
        for candidate_id, job_post_id in db.session.execute(
            select(Application.candidate_id, Application.job_post_id)
        ).all()
    }

    added_users = 0
    added_posts = 0
    added_resumes = 0
    added_applications = 0

    users_by_email: dict[str, User] = {}
    resumes_by_key: dict[tuple[int, str], Resume] = {}
    posts_by_key: dict[tuple[int, str], JobPost] = {}

    # Lượt 1: tài khoản (ứng viên + nhà tuyển dụng) và CV của ứng viên
    for item in data["accounts"]:
        email = item["email"].lower()
        if email in existing_emails:
            user = db.session.scalars(select(User).where(User.email == email)).one()
        else:
            user = User(
                email=email,
                full_name=item["full_name"],
                role=UserRole(item["role"]),
                phone=item.get("phone"),
                company_name=item.get("company_name"),
                company_website=item.get("company_website"),
            )
            user.set_password(DEFAULT_PASSWORD)
            db.session.add(user)
            db.session.flush()  # lấy user.id cho CV và bài đăng bên dưới
            existing_emails.add(email)
            added_users += 1

        users_by_email[email] = user

        for resume_item in item.get("resumes", []):
            title = resume_item["title"]
            if (user.id, title) in existing_resume_keys:
                resume = db.session.scalars(
                    select(Resume).where(
                        Resume.user_id == user.id, Resume.title == title
                    )
                ).one()
            else:
                resume = Resume(
                    user_id=user.id,
                    title=title,
                    resume_type=ResumeType.BUILDER,
                    content=resume_item["content"],
                )
                db.session.add(resume)
                existing_resume_keys.add((user.id, title))
                added_resumes += 1
            resumes_by_key[(user.id, title)] = resume

    db.session.flush()  # lấy resume.id cho đơn ứng tuyển bên dưới

    # Lượt 2: bài đăng tuyển dụng của nhà tuyển dụng
    for item in data["accounts"]:
        employer = users_by_email[item["email"].lower()]
        for post_item in item.get("job_posts", []):
            title = post_item["title"]
            key = (employer.id, title)
            if key in posts_by_key:
                continue

            if key in existing_post_keys:
                post = db.session.scalars(
                    select(JobPost).where(
                        JobPost.employer_id == employer.id, JobPost.title == title
                    )
                ).one()
            else:
                province, district = _find_province_and_district(
                    post_item["province"], post_item["district"], title
                )

                post = JobPost(
                    employer_id=employer.id,
                    title=title,
                    description=post_item["description"],
                    head_count=post_item.get("head_count"),
                    experience_level=ExperienceLevel(post_item["experience_level"]),
                    work_model=WorkModel(post_item["work_model"]),
                    job_type=JobType(post_item["job_type"]),
                    salary_min=post_item.get("salary_min"),
                    salary_max=post_item.get("salary_max"),
                    salary_period=SalaryPeriod(
                        post_item.get("salary_period", SalaryPeriod.MONTHLY.value)
                    ),
                    province_id=province.id,
                    district_id=district.id,
                    address=post_item.get("address"),
                    deadline=datetime.now()
                    + timedelta(days=post_item["deadline_after_days"]),
                )
                db.session.add(post)
                existing_post_keys.add(key)
                added_posts += 1

            posts_by_key[key] = post

    db.session.flush()  # lấy post.id cho đơn ứng tuyển bên dưới

    # Lượt 3: đơn ứng tuyển của ứng viên vào từng bài đăng
    for item in data["accounts"]:
        employer = users_by_email[item["email"].lower()]
        for post_item in item.get("job_posts", []):
            post = posts_by_key[(employer.id, post_item["title"])]

            for application_item in post_item.get("applications", []):
                candidate_email = application_item["candidate"].lower()
                candidate = users_by_email.get(candidate_email)
                if candidate is None:
                    raise ValueError(
                        f"Không tìm thấy ứng viên '{candidate_email}' "
                        f"cho bài đăng '{post.title}'"
                    )

                if (candidate.id, post.id) in existing_application_keys:
                    continue

                resume = resumes_by_key.get((candidate.id, application_item["resume"]))
                if resume is None:
                    raise ValueError(
                        f"Không tìm thấy CV '{application_item['resume']}' "
                        f"của '{candidate_email}' — hãy khai báo CV trong mục "
                        f"'resumes' của tài khoản ứng viên"
                    )

                db.session.add(
                    Application(
                        candidate_id=candidate.id,
                        job_post_id=post.id,
                        resume_id=resume.id,
                        cover_letter=application_item.get("cover_letter"),
                        status=ApplicationStatus(
                            application_item.get(
                                "status", ApplicationStatus.PENDING.value
                            )
                        ),
                        created_at=datetime.now()
                        - timedelta(days=application_item.get("applied_days_ago", 0)),
                    )
                )
                existing_application_keys.add((candidate.id, post.id))
                added_applications += 1

    db.session.commit()
    return added_users, added_posts, added_resumes, added_applications


def main() -> None:
    app = create_app()
    with app.app_context():
        added_users, added_posts, added_resumes, added_applications = seed()
        total_users = db.session.scalar(select(func.count()).select_from(User))
        total_posts = db.session.scalar(select(func.count()).select_from(JobPost))
        total_resumes = db.session.scalar(select(func.count()).select_from(Resume))
        total_applications = db.session.scalar(
            select(func.count()).select_from(Application)
        )
    print(
        f"Đã thêm: {added_users} người dùng, {added_posts} bài đăng, "
        f"{added_resumes} CV, {added_applications} đơn ứng tuyển."
    )
    print(
        f"Tổng trong DB: {total_users} người dùng, {total_posts} bài đăng, "
        f"{total_resumes} CV, {total_applications} đơn ứng tuyển."
    )


if __name__ == "__main__":
    main()
