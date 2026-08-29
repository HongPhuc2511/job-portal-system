# Tạo Module

Mỗi tính năng lớn của dự án được tổ chức thành **1 module** nằm trong `src/modules/<ten_module>/`.

## Cấu trúc chuẩn

```
modules/<ten_module>/
├── __init__.py        # (rỗng hoặc re-export)
├── enums.py           # Enum cho các trạng thái / loại dữ liệu
├── models.py          # SQLAlchemy models
├── schemas.py         # Marshmallow schemas (request / response)
└── routes.py          # Blueprint + các API endpoint
```

## Có thể thêm khi module phức tạp hơn

| File / Thư mục   | Khi nào dùng                                                            |
| ---------------- | ----------------------------------------------------------------------- |
| `services.py`    | Khi logic nghiệp vụ phức tạp, muốn tách khỏi route (gọi từ `routes.py`) |
| `permissions.py` | Các decorator kiểm tra quyền / role (ví dụ `@employer_required`)        |
| `utils.py`       | Hàm tiện ích nhỏ, không thuộc model/schemas                             |
| `constants.py`   | Hằng số dùng trong module (nhãn, message, key...)                       |
| `validators.py`  | Custom validator của Marshmallow dùng riêng cho module                  |
| `dto.py`         | Data Transfer Object — truyền dữ liệu giữa các layer                    |
| `tests/`         | Unit / integration test riêng cho module (nếu tách khỏi `tests/` gốc)   |
| `serializers.py` | Khi muốn tách phần format dữ liệu trả về (tương tự schemas)             |

## Chi tiết từng file

### `__init__.py`

Để trống. Có thể re-export các thành phần chính của module nếu cần:

```python
from .models import Post
from .routes import posts_bp
```

### `enums.py`

Enum Python dùng cho các trạng thái / loại cố định. Kế thừa `str, enum.Enum` để serialize thành string khi trả về API.

```python
import enum


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
```

### `models.py`

Định nghĩa các SQLAlchemy model. Xem chi tiết tại [MODELS.md](MODELS.md).

```python
from datetime import datetime
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from src.extensions import BaseModel


class Post(BaseModel):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

### `schemas.py`

Marshmallow schemas cho **request body / query / response**. Dùng `flask-smorest` để auto sinh tài liệu OpenAPI.

```python
from marshmallow import Schema, fields


class PostCreateRequest(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    content = fields.String(required=True)


class PostResponse(Schema):
    id = fields.Integer(required=True)
    title = fields.String(required=True)
    created_at = fields.DateTime(required=True)
```

### `routes.py`

Khai báo **Blueprint** và định nghĩa các endpoint. Xem chi tiết cách viết API trong [ROUTES.md](ROUTES.md) (sẽ có sau).

```python
from flask_smorest import Blueprint
from src.extensions import db
from .models import Post
from .schemas import PostCreateRequest, PostResponse

posts_bp = Blueprint(
    "posts",
    "posts",
    url_prefix="/api/posts",
    description="Quản lý bài viết",
)


@posts_bp.route("", methods=["POST"])
@posts_bp.arguments(PostCreateRequest)
@posts_bp.response(201, PostResponse)
def create_post(data):
    post = Post(title=data["title"], content=data["content"])
    db.session.add(post)
    db.session.commit()
    return post
```

## Đăng ký module với App

Mở `src/app.py` và **đăng ký 2 thứ**:

### 1. Import models (để Flask-Migrate nhận diện schema)

```python
import src.modules.<ten_module>.models
```

### 2. Đăng ký Blueprint

```python
api.register_blueprint(<ten_module>_bp)
```

## Ví dụ: tạo module `posts`

```
src/modules/posts/
├── __init__.py
├── enums.py          # PostStatus
├── models.py         # Post, Comment
├── schemas.py        # PostCreateRequest, PostResponse, PostListResponse
└── routes.py         # posts_bp
```

Trong `src/app.py`:

```python
import src.modules.posts.models

# ... bên trong create_app()
api.register_blueprint(posts_bp)
```

Sau đó chạy migration để tạo bảng:

```bash
flask db migrate -m "Thêm module posts"
flask db upgrade
```

Xem chi tiết ở [MIGRATIONS.md](MIGRATIONS.md).
