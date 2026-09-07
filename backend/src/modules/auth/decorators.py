from functools import wraps

from flask_jwt_extended import get_jwt, jwt_required

from .enums import UserRole


def role_required(*roles: UserRole):
    """
    Yêu cầu người dùng phải đăng nhập và có role nằm trong `roles`
    mới được phép gọi route.

    Dùng như một decorator, ví dụ:
        @role_required(UserRole.EMPLOYER)
    """
    allowed = {role.value for role in roles}

    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") not in allowed:
                return {
                    "code": "forbidden",
                    "message": "Bạn không có quyền thực hiện thao tác này!",
                }, 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
