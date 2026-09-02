from flask import abort, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt, get_jwt_identity
from flask_smorest import Blueprint
from sqlalchemy import select
from src.extensions import db

from .models import User, TokenBlocklist
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
    """Đăng ký người dùng mới"""
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
        company_name=data.get("company_name"),
        company_website=data.get("company_website"),
    )

    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()

    return {"message": "Đăng ký thành công!"}, 201


@auth_bp.route("/login", methods=["POST"])
@auth_bp.arguments(LoginRequest)
@auth_bp.response(200, schema=TokenResponse, description="Đăng nhập thành công")
def login(data):
    """Đăng nhập người dùng"""
    user = db.session.scalars(
        select(User).where(User.email == data["email"])
    ).one_or_none()

    if not user or not user.check_password(data["password"]):
        abort(401, response=jsonify({
            "code": "invalid_credentials",
            "message": "Email hoặc mật khẩu không đúng!"
        }))

    additional_claims = {"role": user.role.value, "email": user.email}

    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims=additional_claims)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
        },
    }, 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
@auth_bp.response(200, description="Đăng xuất thành công")
def logout():
    """Đăng xuất"""
    jti = get_jwt()["jti"]
    db.session.add(TokenBlocklist(jti=jti))
    db.session.commit()
    return {"message": "Đăng xuất thành công!"}, 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
@auth_bp.response(200, description="Cấp lại Access Token thành công")
def refresh():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    additional_claims = {"role": claims.get("role"), "email": claims.get("email")}

    new_access_token = create_access_token(identity=current_user_id, additional_claims=additional_claims)
    return {"access_token": new_access_token, "token_type": "Bearer"}, 200
