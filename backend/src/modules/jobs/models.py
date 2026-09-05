import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.extensions import BaseModel
from src.modules.auth.models import User
from src.modules.jobs.enums import ApplicationStatus, JobType

if TYPE_CHECKING:
    pass

class ResumeType(str,enum.Enum):
    UPLOAD = "upload"
    BUILDER = "builder"

class Resume(BaseModel):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)

    resume_type: Mapped[ResumeType] = mapped_column(
        SAEnum(ResumeType), nullable=False, default=ResumeType.UPLOAD
    )

    file_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    parsed_text: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="resumes")
    applications: Mapped[list["Application"]] = relationship(
        back_populates="resume", cascade="all, delete-orphan"
    )


class JobPost(BaseModel):
    __tablename__ = "job_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    employer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    salary_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    job_type: Mapped[JobType] = mapped_column(
        Enum(JobType), nullable=False, default=JobType.FULL_TIME
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    employer: Mapped["User"] = relationship(back_populates="job_posts")
    applications: Mapped[list["Application"]] = relationship(
        back_populates="job_post", cascade="all, delete-orphan"
    )


class Application(BaseModel):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    candidate_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    job_post_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("job_posts.id", ondelete="CASCADE"), nullable=False
    )
    resume_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False
    )
    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)
    match_score: Mapped[float | None] = mapped_column(nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.PENDING
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    candidate: Mapped["User"] = relationship(back_populates="applications")
    job_post: Mapped["JobPost"] = relationship(back_populates="applications")
    resume: Mapped["Resume"] = relationship(back_populates="applications")
