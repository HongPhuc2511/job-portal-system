from marshmallow import Schema, fields
from src.modules.posts.schemas import JobPostResponse


class ResumeResponse(Schema):
    id = fields.Integer()
    title = fields.String()
    resume_type = fields.Function(lambda obj: obj.resume_type.value)
    file_path = fields.String(allow_none=True)
    content = fields.Dict(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class ResumeUpdateRequest(Schema):
    title = fields.String(required=False)
    content = fields.Dict(required=False)

class ResumeBuilderRequest(Schema):
    title = fields.String(required=True)
    content = fields.Dict(required=True)


class ApplicationResponse(Schema):
    id = fields.Integer()
    created_at = fields.DateTime()
    status = fields.Function(lambda obj: obj.status.value)
    cover_letter = fields.String(allow_none=True)
    
    job_post = fields.Nested(JobPostResponse)
    resume = fields.Nested(ResumeResponse)