# Backend — Tổng quan

REST API cho hệ thống tuyển dụng, xây bằng **Flask** + **SQLAlchemy 2.0** + **flask-smorest** (OpenAPI/Swagger).

## Tech stack

| Thư viện                               | Mô tả                                            |
| -------------------------------------- | ------------------------------------------------ |
| **Flask 3.1**                          | Web framework                                    |
| **SQLAlchemy 2.0** + **Flask-Migrate** | ORM & migration                                  |
| **Marshmallow / webargs**              | Validation & serialization                       |
| **flask-smorest**                      | REST API + tài liệu OpenAPI/Swagger (`/swagger`) |
| **Flask-JWT-Extended**                 | Xác thực JWT                                     |
| **PyMySQL**                            | Driver MySQL (mặc định dùng SQLite)              |

## Tài liệu

- [STRUCTURE.md](STRUCTURE.md) — Cấu trúc thư mục
- [MODULES.md](MODULES.md) — Cách tạo một module mới
- [MODELS.md](MODELS.md) — Cách tạo model theo chuẩn dự án
- [QUERIES.md](QUERIES.md) — Truy vấn database (SELECT, INSERT, UPDATE, DELETE)
- [ROUTES.md](ROUTES.md) — Cách tạo route (API endpoint)
- [MIGRATIONS.md](MIGRATIONS.md) — Quản lý database & migration
- `http://localhost:5000/swagger` — Tài liệu API tự động

## Chạy dự án

#### Khởi tạo dự án lần đầu

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

set FLASK_APP=run.py
flask db upgrade

python -m src.modules.location.seed
```

#### Chạy ứng dụng chế độ develop

```bash
flask run
```
