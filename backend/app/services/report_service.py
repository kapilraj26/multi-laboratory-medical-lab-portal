from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate


# =====================================================
# CREATE REPORT
# =====================================================

def create_report(
    db: Session,
    staff_user: User,
    report_data: ReportCreate
):
    # -------------------------------------------------
    # Staff/Admin must be active
    # -------------------------------------------------

    if not staff_user.is_active:
        return None, "User account is inactive"

    # -------------------------------------------------
    # Verify role
    # -------------------------------------------------

    if staff_user.role not in ["Staff", "Admin"]:
        return None, "Only Staff or Admin can create reports"

    # -------------------------------------------------
    # Find booking inside staff user's laboratory
    # -------------------------------------------------

    booking = db.query(Booking).filter(
        Booking.booking_id == report_data.booking_id,
        Booking.lab_id == staff_user.lab_id
    ).first()

    if booking is None:
        return None, "Booking not found"

    # -------------------------------------------------
    # Verify patient belongs to same laboratory
    # -------------------------------------------------

    patient = db.query(User).filter(
        User.user_id == booking.patient_id,
        User.lab_id == staff_user.lab_id,
        User.role == "Patient"
    ).first()

    if patient is None:
        return None, "Invalid patient for this booking"

    # -------------------------------------------------
    # Report allowed only for confirmed/completed
    # -------------------------------------------------

    if booking.status not in [
        "Confirmed",
        "Completed"
    ]:
        return None, (
            "Report can only be created for a "
            "confirmed or completed booking"
        )

    # -------------------------------------------------
    # Check duplicate report
    # -------------------------------------------------

    existing_report = db.query(Report).filter(
        Report.booking_id == booking.booking_id
    ).first()

    if existing_report:
        return None, (
            "A report already exists for this booking"
        )

    # -------------------------------------------------
    # Normalize result
    # -------------------------------------------------

    result = report_data.result.strip()

    if not result:
        return None, "Report result cannot be empty"

    # -------------------------------------------------
    # Normalize remarks
    # -------------------------------------------------

    remarks = None

    if report_data.remarks is not None:
        remarks = report_data.remarks.strip()

        if not remarks:
            remarks = None

    # -------------------------------------------------
    # Create report
    # -------------------------------------------------

    new_report = Report(
        booking_id=booking.booking_id,
        lab_id=booking.lab_id,
        patient_id=booking.patient_id,
        test_id=booking.test_id,
        result=result,
        report_file=report_data.report_file,
        remarks=remarks,
        uploaded_by=staff_user.user_id
    )

    try:
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

    except Exception:
        db.rollback()

        return None, "Unable to create report"

    return new_report, None


# =====================================================
# PATIENT - GET OWN REPORTS
# =====================================================

def get_patient_reports(
    db: Session,
    patient_id: int,
    lab_id: int
):
    return db.query(Report).filter(
        Report.patient_id == patient_id,
        Report.lab_id == lab_id
    ).order_by(
        Report.created_at.desc()
    ).all()


# =====================================================
# GET ONE REPORT INSIDE LAB
# =====================================================

def get_report_by_id(
    db: Session,
    report_id: int,
    lab_id: int
):
    return db.query(Report).filter(
        Report.report_id == report_id,
        Report.lab_id == lab_id
    ).first()


# =====================================================
# STAFF / ADMIN - GET LAB REPORTS
# =====================================================

def get_lab_reports(
    db: Session,
    lab_id: int
):
    return db.query(Report).filter(
        Report.lab_id == lab_id
    ).order_by(
        Report.created_at.desc()
    ).all()
