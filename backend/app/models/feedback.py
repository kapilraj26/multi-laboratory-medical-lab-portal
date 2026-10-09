from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("labs.lab_id"),
        nullable=False,
        index=True
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.booking_id"),
        nullable=False,
        unique=True,
        index=True
    )

    rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    comments: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )