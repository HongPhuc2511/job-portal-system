import json
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy import func, select

from src import create_app
from src.extensions import db
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

SEED_DATA_PATH = Path(__file__).parent / "seed_data.json"
DEFAULT_PASSWORD = "123456"


def seed() -> tuple[int, int]:
    """
    Seed người dùng và bài đăng tuyển dụng cho database. Cách chạy:

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

    added_users = 0
    added_posts = 0

    for item in data["accounts"]:
        email = item["email"].lower()
        if email in existing_emails:
            user = db.session.scalars(
                select(User).where(User.email == email)
            ).one()
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
            db.session.flush()  # lấy user.id cho bài đăng bên dưới
            existing_emails.add(email)
            added_users += 1

        for post_item in item.get("job_posts", []):
            title = post_item["title"]
            if (user.id, title) in existing_post_keys:
                continue

            province = db.session.scalars(
                select(Province).where(Province.name == post_item["province"])
            ).one_or_none()
            district = None
            if province is not None:
                district = db.session.scalars(
                    select(District).where(
                        District.province_id == province.id,
                        District.name == post_item["district"],
                    )
                ).one_or_none()
            if province is None or district is None:
                raise ValueError(
                    f"Không tìm thấy '{post_item['province']}' / '{post_item['district']}' "
                    f"cho bài đăng '{title}' — hãy chạy python -m src.modules.location.seed trước"
                )

            db.session.add(
                JobPost(
                    employer_id=user.id,
                    title=title,
                    description=post_item["description"],
                    head_count=post_item.get("head_count"),
                    experience_level=ExperienceLevel(
                        post_item["experience_level"]
                    ),
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
            )
            existing_post_keys.add((user.id, title))
            added_posts += 1

    db.session.commit()
    return added_users, added_posts


def main() -> None:
    app = create_app()
    with app.app_context():
        added_users, added_posts = seed()
        total_users = db.session.scalar(select(func.count()).select_from(User))
        total_posts = db.session.scalar(select(func.count()).select_from(JobPost))
    print(f"Đã thêm: {added_users} người dùng, {added_posts} bài đăng.")
    print(f"Tổng trong DB: {total_users} người dùng, {total_posts} bài đăng.")


if __name__ == "__main__":
    main()