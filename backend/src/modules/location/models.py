from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.extensions import BaseModel

if TYPE_CHECKING:
    pass


class Province(BaseModel):
    """Tỉnh/thành"""

    __tablename__ = "provinces"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    districts: Mapped[list["District"]] = relationship(
        back_populates="province", cascade="all, delete-orphan"
    )


class District(BaseModel):
    """Quận/huyện"""

    __tablename__ = "districts"
    __table_args__ = (
        UniqueConstraint("province_id", "name", name="uq_districts_province_name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    province_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("provinces.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    province: Mapped["Province"] = relationship(back_populates="districts")
