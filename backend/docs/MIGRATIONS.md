# Quản lý Database với Flask-Migrate (Alembic)

Dự án dùng **MySQL** làm database chính. Quản lý schema bằng **Flask-Migrate** (Alembic).
Repo migration đã được khởi tạo sẵn trong `migrations/`, **không cần chạy `flask db init`**.

> Mọi lệnh chạy từ `backend/` sau khi kích hoạt venv.

## Cấu hình

Tạo `.env` ở `backend/`:

```env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/job_portal
```

> **Lưu ý:** Database `job_portal` phải được tạo sẵn trên MySQL server trước khi chạy migration.

Tạo nhanh database:

```sql
CREATE DATABASE job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Setup lần đầu

```bash
set FLASK_APP=run.py
flask db upgrade
```

Lệnh này sẽ chạy các file trong `migrations/versions/` và tạo các bảng: `users`, `token_blocklist`, `job_posts`, `resumes`, `applications`.

> 💡 Xem hướng dẫn tạo model theo chuẩn dự án tại [MODELS.md](MODELS.md).

## Khi thay đổi Model

Flask-Migrate hỗ trợ **auto-generate migration** từ model — nó so sánh model hiện tại với schema trong DB rồi sinh file migration tương ứng.

```bash
set FLASK_APP=run.py

flask db migrate -m "Mô tả thay đổi"   # sinh file migration tự động
# ĐỌC LẠI file trong migrations/versions/ trước khi commit
flask db upgrade                        # áp dụng vào DB
```

> ⚠️ **Luôn đọc lại file migration** sau khi auto-generate. Một số thay đổi Alembic không nhận diện được: đổi tên cột/bảng, đổi kiểu dữ liệu, thay đổi `server_default`...

## Các lệnh thường dùng

| Lệnh                        | Mục đích                                |
| --------------------------- | --------------------------------------- |
| `flask db current`          | Xem revision hiện tại                   |
| `flask db history`          | Xem lịch sử revision                    |
| `flask db upgrade`          | Nâng cấp lên bản mới nhất               |
| `flask db upgrade <rev>`    | Nâng cấp lên revision cụ thể            |
| `flask db downgrade`        | Quay lại 1 revision trước               |
| `flask db downgrade base`   | Xóa toàn bộ bảng                        |
| `flask db stamp <rev>`      | Đánh dấu DB ở revision (không chạy SQL) |
| `flask db migrate -m "..."` | Sinh migration tự động từ model         |

## Reset Database

```bash
# Cách 1: dùng Alembic
flask db downgrade base
flask db upgrade

# Cách 2: xóa và tạo lại database
mysql -u root -p -e "DROP DATABASE job_portal; CREATE DATABASE job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
flask db upgrade
```

## Lỗi thường gặp

- **Không tìm thấy Flask app** → `set FLASK_APP=run.py` hoặc dùng `flask --app run.py ...`
- **Không kết nối được MySQL** → kiểm tra `DATABASE_URL`, user/password, và MySQL đang chạy
- **DB chưa đồng bộ** → `flask db upgrade`
- **`No changes detected` khi `flask db migrate`** → kiểm tra đã import model mới trong `src/app.py` chưa
- **Auto-detect bỏ sót thay đổi** → sửa tay file migration trong `migrations/versions/`
- **Đổi `DATABASE_URL` sang DB khác** → `flask db upgrade` (DB mới) hoặc `flask db stamp head` (nếu schema đã có sẵn)

## Quy trình nhóm

1. Pull code → `flask db upgrade` để đồng bộ
2. Sửa model → `migrate` → đọc lại file → `upgrade`
3. **Commit file migration mới** lên git
4. Thành viên khác pull về chạy `flask db upgrade` là xong
