from flask import abort, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from flask_smorest import Blueprint
from sqlalchemy import select
from src.extensions import db

from .models import User
from .schemas import LoginRequest, RegisterRequest, TokenResponse

auth_bp = Blueprint(
    "auth",
    "auth",
    url_prefix="/api/auth",
    description="Các thao tác quản lý Tài khoản (Đăng ký, Đăng nhập)",
)


@auth_bp.route("/register", methods=["POST"])
@auth_bp.arguments(RegisterRequest)
@auth_bp.response(201, description="Đăng ký thành công")
def register(data):
    """
    Đăng ký người dùng mới
    """
    existing_user = db.session.scalars(
        select(User).where(User.email == data["email"])
    ).one_or_none()

    if existing_user:
        return {
            "code": "email_already_exist",
            "message": "Email này đã được sử dụng!",
        }, 409

    new_user = User(
        email=data["email"],
        full_name=data["full_name"],
        role=User.Role(data.get("role", "seeker")),
        phone=data.get("phone"),
    )

    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()

    return {"message": "Đăng ký thành công!"}, 201


@auth_bp.route("/login", methods=["POST"])
@auth_bp.arguments(LoginRequest)
@auth_bp.response(200, schema=TokenResponse, description="Đăng nhập thành công")
def login(data):
    """
    Đăng nhập người dùng
    """
    user = db.session.scalars(
        select(User).where(User.email == data["email"])
    ).one_or_none()

    if not user or not user.check_password(data["password"]):
        abort(401, response=jsonify({
            "code": "invalid_credentials",
            "message": "Email hoặc mật khẩu không đúng!"
        }))

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
    }, 200
