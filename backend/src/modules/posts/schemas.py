from marshmallow import (
    Schema,
    ValidationError,
    fields,
    validate,
    validates,
    validates_schema,
)
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from src.extensions import db
from src.modules.address import District

from .enums import ExperienceLevel, JobType, SalaryPeriod, WorkModel
from .models import JobPost


class JobPostRequest(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    description = fields.String(required=True)
    requirements = fields.String(allow_none=True)
    head_count = fields.Integer(allow_none=True, validate=validate.Range(min=1))

    experience_level = fields.Enum(ExperienceLevel, required=True)
    work_model = fields.Enum(WorkModel, required=True)
    job_type = fields.Enum(JobType, required=True)

    province_id = fields.Integer(required=True)
    district_id = fields.Integer(required=True)
    address = fields.String(allow_none=True, validate=validate.Length(max=255))

    deadline = fields.DateTime(required=True)  # ISO-8601: "2026-12-31T23:59:59"

    salary_min = fields.Integer(allow_none=True, validate=validate.Range(min=0))
    salary_max = fields.Integer(allow_none=True, validate=validate.Range(min=0))
    salary_period = fields.Enum(SalaryPeriod, load_default=SalaryPeriod.MONTHLY)

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
