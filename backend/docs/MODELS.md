# Tạo Model

Dự án dùng **SQLAlchemy 2.0** với cú pháp khai báo kiểu mới: `DeclarativeBase` + `Mapped[T]` + `mapped_column(...)`.

`Base` được khai báo trong `src/extensions.py`. Khi tạo model mới, **import `BaseModel` từ `src.extensions`** thay vì tự tạo `Base` mới:

```python
from src.extensions import BaseModel
```

## Ví dụ: tạo model mới

Tạo file `src/modules/<ten_module>/models.py`:

```python
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.extensions import BaseModel

if TYPE_CHECKING:
    from src.modules.auth.models import User


class Post(BaseModel):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Cột nullable: khai báo kiểu Optional
    summary: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Quan hệ (FK + relationship)
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    author: Mapped["User"] = relationship(back_populates="posts")

    # Timestamp tự động
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
```

## Quy tắc

- **Luôn kế thừa `BaseModel`** (alias của `db.Model` trong `src/extensions.py`) — KHÔNG tự khai báo `Base` mới.
- **Mỗi model phải có `__tablename__`** ở dạng snake\_case số nhiều (ví dụ: `users`, `job_posts`).
- **Khóa chính:** `id: Mapped[int] = mapped_column(Integer, primary_key=True)`.
- **Nullable:** dùng `Mapped[T | None]` + `nullable=True`. Bắt buộc nhập thì `Mapped[T]` + `nullable=False`.
- **Khóa ngoại:** dùng `ForeignKey("table.col", ondelete="CASCADE")` khi muốn xóa lan truyền.
- **Quan hệ:** khai báo cả 2 phía — `relationship(back_populates="...")` ở cả model cha và con.
- **Timestamp:** dùng `func.now()` cho `server_default` và `onupdate` thay vì hardcode.
- **Import chéo giữa các module:** dùng `if TYPE_CHECKING:` để tránh import vòng tròn.
- **Enum:** khai báo trong `enums.py` của module và import vào `models.py`.

## Đăng ký model để Flask-Migrate nhận diện

Mở `src/app.py` và import module chứa model mới — Flask-Migrate sẽ tự động quét:

```python
import src.modules.<ten_module>.models
```

> Nếu quên import, `flask db migrate` sẽ không thấy thay đổi và báo "No changes detected".
