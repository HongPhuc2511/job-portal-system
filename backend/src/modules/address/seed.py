import json
from pathlib import Path

from sqlalchemy import func, select

from src import create_app
from src.extensions import db

from .models import District, Province

SEED_DATA_PATH = Path(__file__).parent / "seed-data.json"


def seed() -> tuple[int, int]:
    """
    Seed dữ liệu, tạo tỉnh thành và quận/huyện cho database. Cách chạy:

    ```bash
    python -m src.modules.address.seed
    ```
    """
    with open(SEED_DATA_PATH, encoding="utf-8") as f:
        data = json.load(f)

    existing_provinces = set(db.session.scalars(select(Province.name)))
    existing_district_pairs = {
        (d.province_id, d.name) for d in db.session.scalars(select(District))
    }

    added_provinces = 0
    added_districts = 0

    for item in data:
        province_name = item["name"]
        if province_name in existing_provinces:
            province = db.session.scalars(
                select(Province).where(Province.name == province_name)
            ).one()
        else:
            province = Province(name=province_name)
            db.session.add(province)
            db.session.flush()  # lấy province.id cho district bên dưới
            existing_provinces.add(province_name)
            added_provinces += 1

        for district_item in item.get("districts", []):
            district_name = district_item["name"]
            if (province.id, district_name) in existing_district_pairs:
                continue
            db.session.add(District(province_id=province.id, name=district_name))
            existing_district_pairs.add((province.id, district_name))
            added_districts += 1

    # Job remote / tuyển toàn quốc: model yêu cầu district_id không bao giờ NULL,
    # nên cần 1 bản ghi "Toàn Quốc" (province + district) làm nơi neo cho các job này.
    toan_quoc = db.session.scalars(
        select(Province).where(Province.name == "Toàn Quốc")
    ).one_or_none()
    if toan_quoc is None:
        toan_quoc = Province(name="Toàn Quốc")
        db.session.add(toan_quoc)
        db.session.flush()
        added_provinces += 1

    if (toan_quoc.id, "Toàn Quốc") not in existing_district_pairs:
        db.session.add(District(province_id=toan_quoc.id, name="Toàn Quốc"))
        existing_district_pairs.add((toan_quoc.id, "Toàn Quốc"))
        added_districts += 1

    db.session.commit()
    return added_provinces, added_districts


def main() -> None:
    app = create_app()
    with app.app_context():
        added_provinces, added_districts = seed()
        total_provinces = db.session.scalar(select(func.count()).select_from(Province))
        total_districts = db.session.scalar(select(func.count()).select_from(District))
    print(f"Đã thêm: {added_provinces} tỉnh/thành, {added_districts} quận/huyện.")
    print(f"Tổng trong DB: {total_provinces} tỉnh/thành, {total_districts} quận/huyện.")


if __name__ == "__main__":
    main()
