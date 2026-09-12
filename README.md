# job-portal-system

## Một số lưu ý

- Truy cập vào `http://localhost:5000/swagger` để xem tài liệu API của backend
- Truy cập vào [backend/docs/](backend/docs/OVERVIEW.md) và [frontend/docs/](frontend/docs/STRUCTURE.md) để hiểu cấu trúc/kiến trúc của dự án
A job portal connecting candidates and employers — candidates manage CVs and apply to jobs, employers post listings and manage incoming applications.

<p>
  <img src="https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" />
</p>

##  Features

- 📝 **CV / Resume management** — create, edit, delete, and view CVs
  - Upload a CV as a PDF, **or**
  - Build one using a structured form-based CV builder
-  **Job postings**  employers create and manage job listings
-  **Applications**  candidates apply to jobs; employers review and manage received applications
-  **JWT-based authentication**  access & refresh tokens, with a token blocklist on logout
-  Two account roles: **seeker** and **employer**

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Flask, flask-smorest, SQLAlchemy |
| Database | MySQL |
| Auth | flask-jwt-extended (JWT access/refresh + blocklist) |
| Frontend | React, TypeScript, Tailwind CSS, shadcn/ui |
| Tooling | Lefthook (Git hooks for linting/formatting on commit) |

##  Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
flask run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Add a `.env` file with your database URL and JWT secret keys.

##  Documentation

-  **API docs (Swagger UI)**: once the backend is running, visit `http://localhost:5000/swagger` to explore and try out all API endpoints interactively.
-  **Architecture docs**: see [`backend/docs/`](./backend/docs/) and [`frontend/docs/`](./frontend/docs/) for details on the project structure and design decisions.

##  Data Model Overview

- **User**  email-based login, `full_name`, `role` (seeker/employer), optional `phone`, `company_name`, `company_website`
- **Resume**  title, file path (for PDF upload) or structured content (for form builder), parsed text for future AI matching
- **JobPost**  title, description, requirements, location, salary range, job type
- **Application**  links a candidate, a job post, and a resume; tracks status and match score

##  Workflow

Built using a ticket-driven Git workflow: one Jira ticket → one feature branch → one pull request. Lefthook runs linting/formatting checks automatically before each commit.

## 📄 License

This project is for academic purposes.
