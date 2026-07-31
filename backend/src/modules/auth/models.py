import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from src.extensions import BaseModel, db
from werkzeug.security import check_password_hash, generate_password_hash


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

    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False, default=Role.SEEKER)

    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
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
