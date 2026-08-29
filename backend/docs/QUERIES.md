# Truy vấn Database

Dự án dùng **SQLAlchemy 2.0** với cú pháp `select(...)` + `Session.scalars(...)`. Không dùng `session.query(...)` (cũ, 1.x).

`db` được import từ `src.extensions`:

```python
from src.extensions import db
```

## 1. SELECT: Đọc dữ liệu

### Lấy 1 bản ghi (hoặc `None`)

```python
from sqlalchemy import select
from src.extensions import db
from src.modules.auth.models import User

stmt = select(User).where(User.email == email)
user = db.session.scalars(stmt).one_or_none()

if user is None:
    # Không tìm thấy
    ...
```

### Lấy 1 bản ghi (bắt buộc phải có, lỗi nếu không)

```python
user = db.session.scalars(stmt).one()        # lỗi nếu 0 hoặc >1
user = db.session.scalars(stmt).scalar_one()  # giống .one(), trả về phần tử đầu
```

### Lấy nhiều bản ghi

```python
users = db.session.scalars(select(User)).all()
```

### Lấy 1 bản ghi theo khóa chính

```python
user = db.session.get(User, user_id)
```

### Lọc nâng cao

```python
from sqlalchemy import select, or_, and_

# AND nhiều điều kiện
stmt = select(User).where(
    User.role == UserRole.SEEKER,
    User.created_at >= some_date,
)

# OR
stmt = select(User).where(
    or_(User.email == "a@x.com", User.email == "b@x.com")
)

# LIKE
stmt = select(User).where(User.full_name.ilike(f"%{keyword}%"))

# IN
stmt = select(User).where(User.id.in_([1, 2, 3]))

# ORDER BY + LIMIT
stmt = select(JobPost).order_by(JobPost.created_at.desc()).limit(20)
```

### Đếm: kiểm tra tồn tại

```python
from sqlalchemy import select, func

count = db.session.scalar(select(func.count()).select_from(User))   # tổng số user
exists = db.session.scalar(select(User).where(User.email == email).exists())
```

### Chỉ lấy vài cột

```python
# Trả về list[tuple(name, email)]
rows = db.session.execute(
    select(User.full_name, User.email)
).all()
```

## 2. INSERT: Tạo mới

```python
new_user = User(
    email="a@x.com",
    full_name="Nguyen Van A",
    role=UserRole.SEEKER,
)
new_user.set_password("secret123")

db.session.add(new_user)
db.session.commit()

# new_user.id đã có sau khi commit
```

> Trong dự án, model `User` có sẵn `set_password()` để hash mật khẩu — **không gán `password_hash` trực tiếp**.

Thêm nhiều bản ghi cùng lúc:

```python
db.session.add_all([user1, user2, user3])
db.session.commit()
```

## 3. UPDATE: Cập nhật

```python
user = db.session.get(User, user_id)
user.full_name = "Tên mới"
user.phone = "0123456789"

db.session.commit()
```

Hoặc update hàng loạt bằng SQL:

```python
from sqlalchemy import update

db.session.execute(
    update(JobPost)
    .where(JobPost.employer_id == employer_id)
    .values(status="closed")
)
db.session.commit()
```

## 4. DELETE: Xóa

```python
user = db.session.get(User, user_id)
db.session.delete(user)
db.session.commit()
```

> Model đã khai báo `cascade="all, delete-orphan"` ở các quan hệ, nên xóa `User` sẽ tự động xóa `Resume`, `JobPost`, `Application` liên quan (do FK cũng có `ON DELETE CASCADE`).

## 5. Transaction & lỗi

Luôn dùng `try/except` + `rollback` khi có thể phát sinh lỗi:

```python
try:
    db.session.add(new_user)
    db.session.commit()
except Exception:
    db.session.rollback()
    raise
```

## 6. Một số lưu ý

- **Mọi thao tác ghi** (INSERT/UPDATE/DELETE) phải có `db.session.commit()` cuối cùng.
- **Đọc trong transaction** (`scalars`, `get`) **không cần** commit.
- **Không truy vấn trong vòng lặp** (N+1 problem). Dùng `selectinload` / `joinedload` nếu cần load quan hệ:

    ```python
    from sqlalchemy.orm import selectinload

    stmt = select(User).options(selectinload(User.resumes))
    users = db.session.scalars(stmt).all()
    # users[0].resumes đã được load sẵn, không cần query thêm
    ```

- **Mỗi request là 1 transaction ngầm** của Flask-SQLAlchemy — không cần mở/đóng session thủ công trong route.
