from marshmallow import (
    Schema,
    ValidationError,
    fields,
    validate,
    validates_schema,
)
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from sqlalchemy import select

from src.extensions import db
from src.modules.address import District, Province

from .enums import ExperienceLevel, JobType, SalaryPeriod, WorkModel
from .models import JobPost

# Tên bản ghi neo cho job remote / toàn quốc - tìm theo name (unique)
TOAN_QUOC = "Toàn Quốc"


class JobPostRequest(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    description = fields.String(required=True)
    head_count = fields.Integer(allow_none=True, validate=validate.Range(min=1))

    experience_level = fields.Enum(ExperienceLevel, required=True)
    work_model = fields.Enum(WorkModel, required=True)
    job_type = fields.Enum(JobType, required=True)

    province_id = fields.Integer()  # bắt buộc trừ khi work_model == REMOTE
    district_id = fields.Integer()  # bắt buộc trừ khi work_model == REMOTE
    address = fields.String(allow_none=True, validate=validate.Length(max=255))

    deadline = fields.DateTime(required=True)  # ISO-8601: "2026-12-31T23:59:59"

    salary_min = fields.Integer(allow_none=True, validate=validate.Range(min=0))
    salary_max = fields.Integer(allow_none=True, validate=validate.Range(min=0))
    salary_period = fields.Enum(SalaryPeriod, load_default=SalaryPeriod.MONTHLY)

    # Lưu ý: @validates_schema chạy theo thứ tự khai báo (trên → dưới),
    # nên validator này phải đứng TRƯỚC validate_address để REMOTE được tự
    # gán Toàn Quốc trước khi kiểm tra district ∈ province.
    @validates_schema
    def validate_location(self, data, **kwargs):
        work_model = data.get("work_model")
        if work_model == WorkModel.REMOTE:
            province = db.session.scalars(
                select(Province).where(Province.name == TOAN_QUOC)
            ).one_or_none()
            district = None
            if province is not None:
                district = db.session.scalars(
                    select(District).where(
                        District.name == TOAN_QUOC,
                        District.province_id == province.id,
                    )
                ).one_or_none()
            if province is None or district is None:
                raise ValidationError(
                    "Chưa seed 'Toàn Quốc' — hãy chạy python -m src.modules.address.seed",
                    field_name="province_id",
                )
            data["province_id"] = province.id
            data["district_id"] = district.id
            data["address"] = None
        elif work_model is not None:
            if data.get("province_id") is None or data.get("district_id") is None:
                raise ValidationError(
                    "Vui lòng chọn tỉnh/thành và quận/huyện",
                    field_name="province_id",
                )

    @validates_schema
    def validate_address(self, data, **kwargs):
        district_id = data.get("district_id")
        if district_id is not None:
            district = db.session.get(District, district_id)
            if district is None or district.province_id != data.get("province_id"):
                raise ValidationError(
                    "District không thuộc province",
                    field_name="district_id",
                )

    @validates_schema
    def validate_salary(self, data, **kwargs):
        lo, hi = data.get("salary_min"), data.get("salary_max")
        if lo is not None and hi is not None and hi < lo:
            raise ValidationError(
                "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu",
                field_name="salary_max",
            )


class JobPostResponse(SQLAlchemyAutoSchema):
    class Meta:
        model = JobPost
        sqla_session = db.session
        load_instance = True
        include_fk = True

    display_salary = fields.String(
        dump_only=True,
        metadata={
            "example": "10.000.000 - 20.000.000",
            "description": "Mức lương đã được format",
        },
    )
