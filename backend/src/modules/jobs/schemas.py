from marshmallow import Schema, fields


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

class ResumeBuilderRequest(Schema):
    title = fields.String(required=True)
    content = fields.Dict(required=True)