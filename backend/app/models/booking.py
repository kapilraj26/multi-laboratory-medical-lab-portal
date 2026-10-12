from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    booking_id: Mapped[int] = mapped_column(
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

    test_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    booking_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    booking_time: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Pending"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
