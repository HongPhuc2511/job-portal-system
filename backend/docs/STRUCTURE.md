# Cấu trúc dự án

```
backend/
├── run.py                          # Entry point: khởi tạo app, chạy port 5000
├── requirements.txt
├── src/
│   ├── __init__.py                 # Export create_app + các model
│   ├── app.py                      # Application factory (create_app)
│   ├── config.py                   # Config class, đọc từ .env
│   ├── extensions.py               # db, ma, jwt, migrate, api + Base + error handler
│   └── modules/                    # Các module chính của ứng dụng
│       ├── auth/
│       │   ├── enums.py            # UserRole
│       │   ├── models.py           # User, TokenBlocklist
│       │   ├── schemas.py          # RegisterRequest, LoginRequest, TokenResponse
│       │   └── routes.py           # auth_bp: /api/auth/register, /api/auth/login
│       └── jobs/
│           ├── enums.py            # JobType, ApplicationStatus
│           ├── models.py           # Resume, JobPost, Application
│           └── routes.py           # (rỗng — chưa có endpoint)
├── migrations/                     # Alembic
└── docs/                           # Tài liệu
```

## Cấu trúc module

Ở đó mỗi module có cấu trúc như sau

```
modules/<module_name>/
├── __init__.py
├── enums.py                    # Enum cho các trạng thái / loại dữ liệu
├── models.py                   # SQLAlchemy models + Base schema (Marshmallow)
├── schemas.py                  # Request / Response schemas
└── routes.py                   # Khởi tạo blueprint, đăng ký và tạo các api
```

Chi tiết hơn tại [MODULES.md](MODULES.md)
