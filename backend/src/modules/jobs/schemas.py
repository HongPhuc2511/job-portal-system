from marshmallow import Schema, fields


class ResumeResponse(Schema):
    id = fields.Integer()
    title = fields.String()
    file_path = fields.String()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class ResumeUpdateRequest(Schema):
    title = fields.String(required=False)

class ResumeBuilderRequest(Schema):
    title = fields.String(required=True)
    content = fields.Dict(required=True)