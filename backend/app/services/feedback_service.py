from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.feedback import Feedback
from app.models.user import User
from app.schemas.feedback import FeedbackCreate


# =====================================================
# CREATE FEEDBACK
# =====================================================

def create_feedback(
    db: Session,
    patient: User,
    feedback_data: FeedbackCreate
):
    # -------------------------------------------------
    # Check patient account
    # -------------------------------------------------

    if not patient.is_active:
        return None, "Patient account is inactive"

    # -------------------------------------------------
    # Validate rating
    # -------------------------------------------------

    if feedback_data.rating < 1 or feedback_data.rating > 5:
        return None, "Rating must be between 1 and 5"

    # -------------------------------------------------
    # Find booking belonging to:
    # 1. Current patient
    # 2. Current laboratory
    # -------------------------------------------------

    booking = db.query(Booking).filter(
        Booking.booking_id == feedback_data.booking_id,
        Booking.patient_id == patient.user_id,
        Booking.lab_id == patient.lab_id
    ).first()

    if booking is None:
        return None, "Booking not found"

    # -------------------------------------------------
    # Feedback only after completion
    # -------------------------------------------------

    if booking.status != "Completed":
        return None, (
            "Feedback can only be submitted "
            "for completed bookings"
        )

    # -------------------------------------------------
    # Check existing feedback
    # -------------------------------------------------

    existing_feedback = db.query(Feedback).filter(
        Feedback.booking_id == booking.booking_id
    ).first()

    if existing_feedback:
        return None, (
            "Feedback already submitted "
            "for this booking"
        )

    # -------------------------------------------------
    # Normalize comments
    # -------------------------------------------------

    comments = None

    if feedback_data.comments is not None:
        comments = feedback_data.comments.strip()

        if not comments:
            comments = None

    # -------------------------------------------------
    # Create feedback
    # -------------------------------------------------

    new_feedback = Feedback(
        lab_id=booking.lab_id,
        patient_id=patient.user_id,
        booking_id=booking.booking_id,
        rating=feedback_data.rating,
        comments=comments
    )

    try:
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)

    except Exception:
        db.rollback()

        return None, "Unable to submit feedback"

    return new_feedback, None


# =====================================================
# GET PATIENT FEEDBACK
# =====================================================

def get_patient_feedback(
    db: Session,
    patient_id: int,
    lab_id: int
):
    return db.query(Feedback).filter(
        Feedback.patient_id == patient_id,
        Feedback.lab_id == lab_id
    ).order_by(
        Feedback.created_at.desc()
    ).all()


# =====================================================
# GET LAB FEEDBACK
# =====================================================

def get_lab_feedback(
    db: Session,
    lab_id: int
):
    return db.query(Feedback).filter(
        Feedback.lab_id == lab_id
    ).order_by(
        Feedback.created_at.desc()
    ).all()


# =====================================================
# GET ONE FEEDBACK
# =====================================================

def get_feedback_by_id(
    db: Session,
    feedback_id: int,
    lab_id: int
):
    return db.query(Feedback).filter(
        Feedback.feedback_id == feedback_id,
        Feedback.lab_id == lab_id
    ).first()