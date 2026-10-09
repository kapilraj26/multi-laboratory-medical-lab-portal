from sqlalchemy.orm import Session

from app.models.lab import Lab

from app.schemas.lab import LabCreate


# =====================================================
# CREATE LABORATORY
#
# Used for controlled system setup.
# This function is NOT exposed through the public
# /labs/ API.
# =====================================================

def create_lab(
    db: Session,
    lab_data: LabCreate
):

    # -------------------------------------------------
    # Normalize email
    # -------------------------------------------------

    email = str(
        lab_data.email
    ).strip().lower()


    # -------------------------------------------------
    # Check duplicate laboratory email
    # -------------------------------------------------

    existing_lab = db.query(Lab).filter(
        Lab.email == email
    ).first()

    if existing_lab:

        return None, (
            "A laboratory with this email "
            "already exists"
        )


    # -------------------------------------------------
    # Create laboratory
    # -------------------------------------------------

    new_lab = Lab(
        lab_name=lab_data.lab_name.strip(),

        description=lab_data.description,

        address=lab_data.address.strip(),

        city=lab_data.city.strip(),

        state=lab_data.state.strip(),

        pincode=lab_data.pincode.strip(),

        phone=lab_data.phone,

        email=email,

        latitude=lab_data.latitude,

        longitude=lab_data.longitude,

        is_active=True
    )


    # -------------------------------------------------
    # Save laboratory
    # -------------------------------------------------

    try:

        db.add(new_lab)

        db.commit()

        db.refresh(new_lab)

    except Exception:

        db.rollback()

        return None, (
            "Unable to create laboratory"
        )


    return new_lab, None


# =====================================================
# GET ALL ACTIVE LABORATORIES
# =====================================================

def get_all_labs(
    db: Session
):

    return db.query(Lab).filter(
        Lab.is_active == True
    ).order_by(
        Lab.lab_id.asc()
    ).all()


# =====================================================
# GET ONE ACTIVE LABORATORY
# =====================================================

def get_lab_by_id(
    db: Session,
    lab_id: int
):

    return db.query(Lab).filter(
        Lab.lab_id == lab_id,
        Lab.is_active == True
    ).first()