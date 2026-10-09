from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    report_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.booking_id"),
        nullable=False,
        unique=True,
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

    result: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    report_file: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    uploaded_by: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )