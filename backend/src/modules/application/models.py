from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.extensions import BaseModel
from src.modules.application.enums import ApplicationStatus

if TYPE_CHECKING:
    from src.modules.auth.models import User
    from src.modules.posts.models import JobPost
    from src.modules.resume.models import Resume


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
