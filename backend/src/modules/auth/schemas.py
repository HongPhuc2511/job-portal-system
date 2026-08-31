from marshmallow import Schema, fields, validate

class UserResponse(Schema):
    id = fields.Integer()
    email = fields.Email()
    full_name = fields.String()
    role = fields.String()


class RegisterRequest(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))
    full_name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    role = fields.String(validate=validate.OneOf(["seeker", "employer"]))
    phone = fields.String()
    company_name = fields.String()
    company_website = fields.String()

class LoginRequest(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)


class TokenResponse(Schema):
    access_token = fields.String(required=True)
    refresh_token = fields.String(required=True)
    token_type = fields.String(required=True, validate=validate.Equal("Bearer"))
    user = fields.Nested(UserResponse)