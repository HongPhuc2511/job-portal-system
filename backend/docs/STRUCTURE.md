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
│       ├── auth/                   # Tài khoản người dùng
│       │   ├── enums.py            # UserRole
│       │   ├── models.py           # User, TokenBlocklist
│       │   ├── schemas.py          # RegisterRequest, LoginRequest, TokenResponse
│       │   └── routes.py           # auth_bp: /api/auth/register, /api/auth/login
│       ├── application/            # Hồ sơ ứng tuyển
│       │   ├── enums.py            # ApplicationStatus (pending / approved / rejected)
│       │   ├── models.py           # Application
│       │   ├── schemas.py          # ApplicationResponse, JobPostApplicationResponse, ...
│       │   ├── services.py         # reject_pending_applications (đóng bài đăng → từ chối)
│       │   └── routes.py           # applications_bp: /api/applications (việc đã ứng tuyển, đổi trạng thái)
│       ├── resume/                 # CV của ứng viên
│       │   ├── enums.py            # ResumeType (upload / builder)
│       │   ├── models.py           # Resume
│       │   ├── schemas.py          # ResumeResponse, ResumeBuilderRequest, ...
│       │   └── routes.py           # resumes_bp: /api/resumes
│       ├── posts/                  # Bài đăng tuyển dụng
│       │   ├── enums.py            # JobType, JobPostStatus, ExperienceLevel, WorkModel, SalaryPeriod
│       │   ├── models.py           # JobPost
│       │   ├── schemas.py          # JobPostRequest, JobPostResponse, JobPostStatusUpdateRequest, ...
│       │   ├── routes.py           # job_posts_bp: /api/posts (CRUD + apply + hồ sơ + dashboard + status)
│       │   ├── seed.py             # Seed tài khoản, bài đăng, CV, hồ sơ ứng tuyển (từ seed_data.json)
│       │   └── seed_data.json      # Dữ liệu mẫu
│       └── location/               # Địa điểm
│           ├── models.py           # Province, District
│           ├── schemas.py          # ProvinceResponse, DistrictResponse
│           ├── routes.py           # location_bp: /api/provinces, /api/districts
│           ├── seed.py             # Seed tỉnh/thành, quận/huyện (từ seed-data.json)
│           └── seed-data.json      # Dữ liệu mẫu
├── migrations/                     # Alembic
└── docs/                           # Tài liệu
```

## Cấu trúc module

Ở đó mỗi module có cấu trúc như sau

```
modules/<module_name>/
├── __init__.py
├── enums.py                    # Enum cho các trạng thái / loại dữ liệu
├── models.py                   # SQLAlchemy models
├── schemas.py                  # Request / Response schemas
├── services.py                 # (tuỳ module) Logic nghiệp vụ dùng chung nhiều nơi
└── routes.py                   # Khởi tạo blueprint, đăng ký và tạo các api
```

Chi tiết hơn tại [MODULES.md](MODULES.md)
