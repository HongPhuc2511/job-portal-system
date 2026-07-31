from typing import TYPE_CHECKING

from flask import abort, jsonify
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_smorest import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from webargs.flaskparser import parser


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
ma = Marshmallow()
migrate = Migrate()
jwt = JWTManager()
api = Api()

if TYPE_CHECKING:
    BaseModel = Base
else:
    BaseModel = db.Model

@parser.error_handler
def handle_request_parsing_error(err, req, schema, *, error_status_code, error_headers):
    """
    Bắt mọi lỗi validation của webargs trên toàn dự án và format lại
    """
    abort(400, response=jsonify({
        "code": "invalid_input",
        "message": "Validation error",
        "errors": err.messages
    }))