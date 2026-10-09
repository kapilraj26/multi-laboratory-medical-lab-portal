from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.lab import Lab
from app.models.lab_test import LabTest
from app.models.user import User

from app.schemas.booking import BookingCreate


# =====================================================
# CREATE BOOKING
# =====================================================

def create_booking(
    db: Session,
    patient: User,
    booking_data: BookingCreate
):
    # -------------------------------------------------
    # Verify patient is active
    # -------------------------------------------------

    if not patient.is_active:
        return None, "Patient account is inactive"

    # -------------------------------------------------
    # Laboratory isolation
    # -------------------------------------------------

    if patient.lab_id != booking_data.lab_id:
        return None, (
            "You cannot book a test from another laboratory"
        )

    # -------------------------------------------------
    # Verify laboratory
    # -------------------------------------------------

    lab = db.query(Lab).filter(
        Lab.lab_id == booking_data.lab_id,
        Lab.is_active == True
    ).first()

    if lab is None:
        return None, "Laboratory not found"

    # -------------------------------------------------
    # Verify test belongs to same laboratory
    # -------------------------------------------------

    test = db.query(LabTest).filter(
        LabTest.lab_id == booking_data.lab_id,
        LabTest.test_id == booking_data.test_id,
        LabTest.is_active == True
    ).first()

    if test is None:
        return None, "Laboratory test not found"

    # -------------------------------------------------
    # Check duplicate booking
    # Cancelled bookings do not block rebooking
    # -------------------------------------------------

    existing_booking = db.query(Booking).filter(
        Booking.patient_id == patient.user_id,
        Booking.lab_id == booking_data.lab_id,
        Booking.test_id == booking_data.test_id,
        Booking.booking_date == booking_data.booking_date,
        Booking.booking_time == booking_data.booking_time,
        Booking.status != "Cancelled"
    ).first()

    if existing_booking:
        return None, (
            "You already have a booking for this "
            "test at this time"
        )

    # -------------------------------------------------
    # Create booking
    # -------------------------------------------------

    new_booking = Booking(
        lab_id=booking_data.lab_id,
        patient_id=patient.user_id,
        test_id=booking_data.test_id,
        booking_date=booking_data.booking_date,
        booking_time=booking_data.booking_time,
        status="Pending"
    )

    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)

    except Exception:
        db.rollback()

        return None, "Unable to create booking"

    return new_booking, None


# =====================================================
# GET PATIENT BOOKINGS
# =====================================================

def get_patient_bookings(
    db: Session,
    patient_id: int,
    lab_id: int
):
    return db.query(Booking).filter(
        Booking.patient_id == patient_id,
        Booking.lab_id == lab_id
    ).order_by(
        Booking.booking_date.asc(),
        Booking.booking_time.asc()
    ).all()


# =====================================================
# GET ONE PATIENT BOOKING
# =====================================================

def get_booking_by_id(
    db: Session,
    booking_id: int,
    patient_id: int,
    lab_id: int
):
    return db.query(Booking).filter(
        Booking.booking_id == booking_id,
        Booking.patient_id == patient_id,
        Booking.lab_id == lab_id
    ).first()


# =====================================================
# GET ALL BOOKINGS OF A LABORATORY
# =====================================================

def get_lab_bookings(
    db: Session,
    lab_id: int
):
    return db.query(Booking).filter(
        Booking.lab_id == lab_id
    ).order_by(
        Booking.booking_date.asc(),
        Booking.booking_time.asc()
    ).all()


# =====================================================
# UPDATE BOOKING STATUS
# =====================================================

def update_booking_status(
    db: Session,
    booking_id: int,
    lab_id: int,
    new_status: str
):
    # -------------------------------------------------
    # Find booking only inside current laboratory
    # -------------------------------------------------

    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id,
        Booking.lab_id == lab_id
    ).first()

    if booking is None:
        return None, "Booking not found"

    # -------------------------------------------------
    # Allowed statuses
    # -------------------------------------------------

    allowed_statuses = {
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
    }

    if new_status not in allowed_statuses:
        return None, "Invalid booking status"

    # -------------------------------------------------
    # Prevent unnecessary status update
    # -------------------------------------------------

    if booking.status == new_status:
        return booking, None

    # -------------------------------------------------
    # Valid status transitions
    #
    # Pending
    #   → Confirmed
    #   → Cancelled
    #
    # Confirmed
    #   → Completed
    #   → Cancelled
    #
    # Completed
    #   → no further changes
    #
    # Cancelled
    #   → no further changes
    # -------------------------------------------------

    valid_transitions = {
        "Pending": {
            "Confirmed",
            "Cancelled"
        },
        "Confirmed": {
            "Completed",
            "Cancelled"
        },
        "Completed": set(),
        "Cancelled": set()
    }

    if new_status not in valid_transitions.get(
        booking.status,
        set()
    ):
        return None, "Invalid booking status transition"

    # -------------------------------------------------
    # Update status
    # -------------------------------------------------

    booking.status = new_status

    try:
        db.commit()
        db.refresh(booking)

    except Exception:
        db.rollback()

        return None, "Unable to update booking status"

    return booking, None