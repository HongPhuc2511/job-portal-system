from marshmallow import Schema, fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from src.extensions import db
from src.modules.location.schemas import DistrictResponse, ProvinceResponse
from src.modules.posts.models import JobPost
from src.modules.posts.schemas import EmployerInfo
from src.modules.resume.schemas import ResumeResponse

from .enums import ApplicationStatus


class ApplicationStatusUpdateRequest(Schema):
    """
    Cập nhật trạng thái xử lý hồ sơ (pending / approved / rejected)
    """

    status = fields.Enum(ApplicationStatus, required=True)


class CandidateInfo(Schema):
    """
    Thông tin cơ bản của ứng viên gắn với hồ sơ
    """

    id = fields.Integer()
    full_name = fields.String()
    email = fields.String()
    phone = fields.String(allow_none=True)


class ApplicationResponse(Schema):
    """
    Hồ sơ ứng tuyển đầy đủ thông tin ứng viên + CV + bài đăng
    """

    class JobPostMinimalResponse(SQLAlchemyAutoSchema):
        class Meta:
            model = JobPost
            sqla_session = db.session
            load_instance = True
            include_fk = True
            fields = (
                "id",
                "title",
                "status",
                "head_count",
                "job_type",
                "work_model",
                "experience_level",
            )

        display_salary = fields.String(
            dump_only=True,
            metadata={
                "example": "10.000.000 - 20.000.000",
                "description": "Mức lương đã được format",
            },
        )

        province = fields.Nested(ProvinceResponse, dump_only=True)
        district = fields.Nested(DistrictResponse, dump_only=True)
        employer = fields.Nested(EmployerInfo, dump_only=True)

    id = fields.Integer()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    status = fields.Function(lambda obj: obj.status.value)
    cover_letter = fields.String(allow_none=True)

    candidate = fields.Nested(CandidateInfo)
    resume = fields.Nested(ResumeResponse)
    job_post = fields.Nested(JobPostMinimalResponse)


class JobPostApplicationResponse(Schema):
    id = fields.Integer()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    status = fields.Function(lambda obj: obj.status.value)
    cover_letter = fields.String(allow_none=True)

    candidate = fields.Nested(CandidateInfo)
    resume = fields.Nested(ResumeResponse)
