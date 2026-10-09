from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Lab(Base):
    __tablename__ = "labs"

    lab_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    lab_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    pincode: Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True
    )

    latitude: Mapped[float | None] = mapped_column(
        nullable=True
    )

    longitude: Mapped[float | None] = mapped_column(
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
