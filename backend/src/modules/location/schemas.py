from marshmallow import Schema, fields


class ProvinceResponse(Schema):
    id = fields.Integer()
    name = fields.String()


class DistrictResponse(Schema):
    id = fields.Integer()
    name = fields.String()


class DistrictDetailResponse(Schema):
    id = fields.Integer()
    name = fields.String()
    province = fields.Nested(ProvinceResponse())
