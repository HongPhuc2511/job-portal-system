from flask_smorest import Blueprint, abort
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from src.extensions import db

from .models import District, Province
from .schemas import DistrictDetailResponse, DistrictResponse, ProvinceResponse

location_bp = Blueprint(
    "location",
    "location",
    url_prefix="/api/location",
    description="Danh bạ địa danh (tỉnh/thành, quận/huyện)",
)


@location_bp.route("/provinces", methods=["GET"])
@location_bp.response(
    200,
    schema=ProvinceResponse(many=True),
    description="Danh sách tỉnh/thành",
)
def get_provinces():
    """Lấy danh sách tỉnh/thành"""
    stmt = select(Province).order_by(Province.id)
    return db.session.scalars(stmt).all()


@location_bp.route("/provinces/<int:province_id>/districts", methods=["GET"])
@location_bp.response(
    200,
    schema=DistrictResponse(many=True),
    description="Danh sách quận/huyện của một tỉnh/thành",
)
def get_districts(province_id: int):
    """Lấy danh sách quận/huyện thuộc một tỉnh/thành"""
    province = db.session.get(Province, province_id)
    if province is None:
        abort(404, message="Tỉnh/thành không tồn tại!")

    stmt = (
        select(District)
        .where(District.province_id == province_id)
        .order_by(District.id)
    )
    return db.session.scalars(stmt).all()


@location_bp.route("/districts/<int:district_id>", methods=["GET"])
@location_bp.response(
    200,
    schema=DistrictDetailResponse(),
    description="Lấy thông tin quận/huyện",
)
def get_district(district_id: int):
    """Lấy thông tin quận/huyện"""
    district = db.session.get(
        District,
        district_id,
        options=[joinedload(District.province)],
    )
    if district is None:
        abort(404, message="Quận/huyện không tồn tại!")

    return district
