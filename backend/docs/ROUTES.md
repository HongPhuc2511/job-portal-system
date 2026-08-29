# Tạo Route (API Endpoint)

Dự án dùng **flask-smorest** — Flask + Marshmallow kết hợp, tự động sinh tài liệu **OpenAPI 3** hiển thị ở `/swagger`.

Mỗi route khai báo qua `Blueprint` của `flask_smorest`, không dùng `@app.route(...)` trực tiếp.

## Khai báo Blueprint

Trong `src/modules/<ten_module>/routes.py`:

```python
from flask_smorest import Blueprint

posts_bp = Blueprint(
    "posts",                # tên blueprint (hiển thị trong OpenAPI)
    "posts",                # import_name
    url_prefix="/api/posts",
    description="Quản lý bài viết",
)
```

> Blueprint phải được **đăng ký** trong `src/app.py` bằng `api.register_blueprint(posts_bp)`.

## Cú pháp cơ bản

```python
@posts_bp.route("", methods=["POST"])
@posts_bp.arguments(CreatePostRequest)              # validate body
@posts_bp.response(201, PostResponse)               # response mặc định
def create(data):
    """Docstring sẽ hiển thị trong Swagger UI"""
    ...
    return new_post, 201
```

Decorator `@blp.arguments` **tự validate** request body theo Schema. Nếu lỗi sẽ trả `400` với format `{code, message, errors}` (đã có handler trong `extensions.py`).

## Các decorator quan trọng

| Decorator | Công dụng |
|---|---|
| `@blp.route(rule, methods=[...])` | Khai báo endpoint |
| `@blp.arguments(Schema, location=...)` | Validate & parse dữ liệu đầu vào |
| `@blp.response(status, schema=None, description=...)` | Mô tả response thành công |
| `@blp.alt_response(status, schema=None, description=...)` | Mô tả response phụ (lỗi) |
| `@blp.paginate()` | Tự động inject tham số phân trang (`page`, `page_size`) |
| `@blp.doc(...)` | Bổ sung mô tả OpenAPI nâng cao |

### `location` của `@blp.arguments`

Mặc định là `"json"`. Các giá trị hỗ trợ:

```
json | query | querystring | path | form | headers | cookies | files | json_or_form
```

## Ví dụ đầy đủ: CRUD cho Post

### Schema (`schemas.py`)

```python
from marshmallow import Schema, fields, validate


class CreatePostRequest(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    content = fields.String(required=True)


class UpdatePostRequest(Schema):
    title = fields.String(validate=validate.Length(min=1, max=200))
    content = fields.String()


class PostResponse(Schema):
    id = fields.Integer(required=True)
    title = fields.String(required=True)
    content = fields.String(required=True)
    created_at = fields.DateTime(required=True)


class PostQueryArgs(Schema):
    keyword = fields.String(load_default=None)
    page = fields.Integer(load_default=1)
    page_size = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
```

### Routes (`routes.py`)

```python
from flask import abort
from flask_smorest import Blueprint
from sqlalchemy import select
from src.extensions import db

from .models import Post
from .schemas import (
    CreatePostRequest,
    PostQueryArgs,
    PostResponse,
    UpdatePostRequest,
)

posts_bp = Blueprint(
    "posts",
    "posts",
    url_prefix="/api/posts",
    description="Quản lý bài viết",
)


# Lấy danh sách (có query args + phân trang)
@posts_bp.route("", methods=["GET"])
@posts_bp.arguments(PostQueryArgs, location="query")
@posts_bp.response(200, PostResponse(many=True))
def list_posts(query):
    """Lấy danh sách bài viết"""
    stmt = select(Post)
    if query.get("keyword"):
        stmt = stmt.where(Post.title.ilike(f"%{query['keyword']}%"))
    stmt = stmt.order_by(Post.created_at.desc())
    return db.session.scalars(stmt).all()


# Tạo mới
@posts_bp.route("", methods=["POST"])
@posts_bp.arguments(CreatePostRequest)
@posts_bp.response(201, PostResponse)
def create_post(data):
    """Tạo bài viết mới"""
    post = Post(title=data["title"], content=data["content"])
    db.session.add(post)
    db.session.commit()
    return post


# Lấy chi tiết theo id (path param)
@posts_bp.route("/<int:post_id>", methods=["GET"])
@posts_bp.response(200, PostResponse)
@posts_bp.alt_response(404, description="Không tìm thấy")
def get_post(post_id):
    """Lấy chi tiết bài viết"""
    post = db.session.get(Post, post_id)
    if post is None:
        abort(404, message="Không tìm thấy bài viết")
    return post


# Cập nhật
@posts_bp.route("/<int:post_id>", methods=["PUT"])
@posts_bp.arguments(UpdatePostRequest)
@posts_bp.response(200, PostResponse)
def update_post(data, post_id):
    """Cập nhật bài viết"""
    post = db.session.get(Post, post_id)
    if post is None:
        abort(404, message="Không tìm thấy bài viết")

    for key, value in data.items():
        setattr(post, key, value)
    db.session.commit()
    return post


# Xóa
@posts_bp.route("/<int:post_id>", methods=["DELETE"])
@posts_bp.response(204)
def delete_post(post_id):
    """Xóa bài viết"""
    post = db.session.get(Post, post_id)
    if post is None:
        abort(404, message="Không tìm thấy bài viết")
    db.session.delete(post)
    db.session.commit()
    return ""
```

## Đăng ký Blueprint

Trong `src/app.py`:

```python
from src.modules.posts.routes import posts_bp

# ... bên trong create_app()
api.register_blueprint(posts_bp)
```

Sau khi đăng ký, các endpoint sẽ tự động xuất hiện ở `http://localhost:5000/swagger`.

## Xử lý lỗi

Dùng `abort()` từ `flask_smorest` (đã tích hợp với API) — nó tự trả response lỗi chuẩn OpenAPI:

```python
from flask_smorest import abort

abort(404, message="Không tìm thấy bài viết")
abort(401, message="Chưa đăng nhập")
abort(403, message="Không có quyền")
```

Nếu muốn trả về JSON có format riêng (giống pattern hiện tại của dự án ở `auth/routes.py`):

```python
from flask import abort, jsonify

abort(409, response=jsonify({
    "code": "email_already_exist",
    "message": "Email này đã được sử dụng!",
}))
```

## Kết hợp với JWT (xác thực)

Dùng decorator của `flask_jwt_extended` đặt **trước** các decorator của `flask_smorest`:

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@posts_bp.route("", methods=["POST"])
@jwt_required()
@posts_bp.arguments(CreatePostRequest)
@posts_bp.response(201, PostResponse)
def create_post(data):
    current_user_id = get_jwt_identity()
    # ... dùng current_user_id để tạo post
```

> Lưu ý thứ tự decorator: `@jwt_required()` phải **gần function nhất** trong chuỗi (tức đặt sau các `@blp.arguments` / `@blp.response`).

## Path parameters

Path param khai báo trực tiếp trong rule theo cú pháp Flask:

```python
@posts_bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):        # Flask tự convert và inject vào hàm
    ...
```

Các converter: `string`, `int`, `float`, `path`, `uuid`.

## Phân trang (`@blp.paginate`)

```python
@posts_bp.route("", methods=["GET"])
@posts_bp.paginate()
@posts_bp.response(200, PostResponse(many=True))
def list_posts(pagination_parameters):
    stmt = select(Post).order_by(Post.created_at.desc())
    items = db.session.scalars(stmt).all()
    pagination_parameters.item_count = len(items)
    return items[
        pagination_parameters.first_item : pagination_parameters.last_item
    ]
```

Response trả về tự có dạng:

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20
}
```

## Lỗi thường gặp

- **Endpoint không xuất hiện ở `/swagger`** → quên `api.register_blueprint(...)` trong `app.py`.
- **`Marshmallow` validate fail nhưng không thấy lỗi rõ** → check `extensions.py` đã có handler `handle_request_parsing_error` (xử lý lỗi webargs).
- **`@blp.arguments` không nhận body** → kiểm tra `Content-Type: application/json` của request và `location="json"` (mặc định).
- **Path param bị `None`** → sai converter (ví dụ dùng `<post_id>` thay vì `<int:post_id>`).
- **Trả về object SQLAlchemy nhưng muốn format đẹp** → truyền qua `Schema(many=True)` hoặc viết `PostResponse(Schema)` rồi `.dump(obj)`.
