from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.extensions import BaseModel

from .enums import ExperienceLevel, JobPostStatus, JobType, SalaryPeriod, WorkModel

if TYPE_CHECKING:
    from src.modules.location import District, Province
    from src.modules.auth.models import User
    from src.modules.jobs.models import Application


class JobPost(BaseModel):
    __tablename__ = "job_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    status: Mapped[JobPostStatus] = mapped_column(
        Enum(JobPostStatus), nullable=False, default=JobPostStatus.ACTIVE
    )
    published_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    head_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    experience_level: Mapped[ExperienceLevel] = mapped_column(
        Enum(ExperienceLevel), nullable=False
    )
    work_model: Mapped[WorkModel] = mapped_column(Enum(WorkModel), nullable=False)
    job_type: Mapped[JobType] = mapped_column(
        Enum(JobType), nullable=False, default=JobType.FULL_TIME
    )

    salary_min: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    salary_period: Mapped[SalaryPeriod] = mapped_column(
        Enum(SalaryPeriod), nullable=False, default=SalaryPeriod.MONTHLY
    )

    province: Mapped["Province"] = relationship()
    province_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("provinces.id", ondelete="RESTRICT"), nullable=False
    )
    district: Mapped["District"] = relationship()
    district_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False
    )
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)

    employer: Mapped["User"] = relationship(back_populates="job_posts")
    employer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    applications: Mapped[list["Application"]] = relationship(
        back_populates="job_post", cascade="all, delete-orphan"
    )

    @property
    def display_salary(self) -> str:
        match (self.salary_min, self.salary_max):
            case (None, None):
                return "Thương lượng"
            case (min, max) if min is not None and max is not None:
                if min == max:
                    return f"{min:,.0f}".replace(",", ".")
                return f"{min:,.0f} - {max:,.0f}".replace(",", ".")
            case (min, None) if min is not None:
                return f"Từ {min:,.0f}".replace(",", ".")
            case (None, max) if max is not None:
                return f"Tới {max:,.0f}".replace(",", ".")
            case _:
                return "Lỗi?! Sao có thể xảy ra trường hợp này được"
