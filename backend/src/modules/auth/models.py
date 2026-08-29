import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.extensions import BaseModel
from src.modules.auth.enums import UserRole
from werkzeug.security import check_password_hash, generate_password_hash

if TYPE_CHECKING:
    from src.modules.jobs.models import Application, JobPost, Resume


class User(BaseModel):
    __tablename__ = "users"

    class Role(str, enum.Enum):
        SEEKER = "seeker"
        EMPLOYER = "employer"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False, index=True
    )

    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), nullable=False, default=UserRole.SEEKER
    )

    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    company_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    company_website: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    resumes: Mapped[list["Resume"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    job_posts: Mapped[list["JobPost"]] = relationship(
        back_populates="employer", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )

    def set_password(self, password: str):
        """
        Băm mật khẩu trước khi lưu vào DB
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """
        Kiểm tra mật khẩu người dùng nhập có khớp với hash trong DB không
        """
        return check_password_hash(self.password_hash, password)


class TokenBlocklist(BaseModel):
    __tablename__ = "token_blocklist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    jti: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
