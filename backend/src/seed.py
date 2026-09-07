import importlib

from sqlalchemy import func, select

from src import create_app
from src.extensions import db
from src.modules.auth.models import User
from src.modules.location.models import District, Province
from src.modules.posts.models import JobPost

seed_locations = importlib.import_module("src.modules.location.seed").seed
seed_posts = importlib.import_module("src.modules.posts.seed").seed


def seed_all() -> tuple[int, int, int, int]:
    added_provinces, added_districts = seed_locations()
    added_users, added_posts = seed_posts()
    return added_provinces, added_districts, added_users, added_posts


def main() -> None:
    app = create_app()
    with app.app_context():
        added_provinces, added_districts, added_users, added_posts = seed_all()
        total_provinces = db.session.scalar(select(func.count()).select_from(Province))
        total_districts = db.session.scalar(select(func.count()).select_from(District))
        total_users = db.session.scalar(select(func.count()).select_from(User))
        total_posts = db.session.scalar(select(func.count()).select_from(JobPost))

    print("=== SEED HOÀN TẤT ===")
    print(
        f"Đã thêm: {added_provinces} tỉnh/thành, {added_districts} quận/huyện, "
        f"{added_users} người dùng, {added_posts} bài đăng."
    )
    print(
        f"Tổng trong DB: {total_provinces} tỉnh/thành, {total_districts} quận/huyện, "
        f"{total_users} người dùng, {total_posts} bài đăng."
    )


if __name__ == "__main__":
    main()
