from sqlalchemy.orm import Session

from app.models.user import User
from app.models.lab import Lab

from app.schemas.user import (
    UserCreate,
    StaffCreate,
    PatientCreate
)

from app.core.security import hash_password


# =====================================================
# NORMALIZATION HELPERS
# =====================================================

def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_name(name: str) -> str:
    return " ".join(name.strip().split())


def normalize_phone(phone: str | None) -> str | None:
    if phone is None:
        return None

    phone = phone.strip()

    return phone if phone else None


# =====================================================
# GENERIC USER CREATE
# =====================================================

def create_user(
    db: Session,
    user_data: UserCreate
):
    email = normalize_email(
        str(user_data.email)
    )

    name = normalize_name(
        user_data.name
    )

    phone = normalize_phone(
        user_data.phone
    )

    # -------------------------------------------------
    # Check laboratory
    # -------------------------------------------------

    lab = db.query(Lab).filter(
        Lab.lab_id == user_data.lab_id,
        Lab.is_active == True
    ).first()

    if lab is None:
        return None, "Laboratory not found"

    # -------------------------------------------------
    # Check duplicate email
    # -------------------------------------------------

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        return None, (
            "A user with this email already exists"
        )

    # -------------------------------------------------
    # Hash password
    # -------------------------------------------------

    hashed_password = hash_password(
        user_data.password
    )

    # -------------------------------------------------
    # Create user
    # -------------------------------------------------

    new_user = User(
        lab_id=user_data.lab_id,
        name=name,
        email=email,
        password_hash=hashed_password,
        role=user_data.role,
        phone=phone,
        is_active=True
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except Exception:
        db.rollback()

        return None, "Unable to create user"

    return new_user, None


# =====================================================
# GET USERS BY LAB
# =====================================================

def get_users_by_lab(
    db: Session,
    lab_id: int
):
    return db.query(User).filter(
        User.lab_id == lab_id,
        User.is_active == True
    ).order_by(
        User.user_id.asc()
    ).all()


# =====================================================
# GET USER BY ID
# =====================================================

def get_user_by_id(
    db: Session,
    user_id: int
):
    return db.query(User).filter(
        User.user_id == user_id,
        User.is_active == True
    ).first()


# =====================================================
# CREATE STAFF
# =====================================================

def create_staff_for_lab(
    db: Session,
    lab_id: int,
    staff_data: StaffCreate
):
    email = normalize_email(
        str(staff_data.email)
    )

    name = normalize_name(
        staff_data.name
    )

    phone = normalize_phone(
        staff_data.phone
    )

    # -------------------------------------------------
    # Check laboratory
    # -------------------------------------------------

    lab = db.query(Lab).filter(
        Lab.lab_id == lab_id,
        Lab.is_active == True
    ).first()

    if lab is None:
        return None, "Laboratory not found"

    # -------------------------------------------------
    # Check duplicate email
    # -------------------------------------------------

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        return None, (
            "A user with this email already exists"
        )

    # -------------------------------------------------
    # Hash password
    # -------------------------------------------------

    hashed_password = hash_password(
        staff_data.password
    )

    # -------------------------------------------------
    # Create staff
    # -------------------------------------------------

    new_staff = User(
        lab_id=lab_id,
        name=name,
        email=email,
        password_hash=hashed_password,
        role="Staff",
        phone=phone,
        is_active=True
    )

    try:
        db.add(new_staff)
        db.commit()
        db.refresh(new_staff)

    except Exception:
        db.rollback()

        return None, (
            "Unable to create staff account"
        )

    return new_staff, None


# =====================================================
# CREATE ADMIN
# =====================================================

def create_admin_for_lab(
    db: Session,
    lab_id: int,
    name: str,
    email: str,
    password: str,
    phone: str | None = None
):
    normalized_email = normalize_email(email)
    normalized_name = normalize_name(name)
    normalized_phone = normalize_phone(phone)

    # -------------------------------------------------
    # Check laboratory
    # -------------------------------------------------

    lab = db.query(Lab).filter(
        Lab.lab_id == lab_id,
        Lab.is_active == True
    ).first()

    if lab is None:
        return None, "Laboratory not found"

    # -------------------------------------------------
    # Check duplicate email
    # -------------------------------------------------

    existing_user = db.query(User).filter(
        User.email == normalized_email
    ).first()

    if existing_user:
        return None, (
            "A user with this email already exists"
        )

    # -------------------------------------------------
    # Hash password
    # -------------------------------------------------

    hashed_password = hash_password(
        password
    )

    # -------------------------------------------------
    # Create admin
    # -------------------------------------------------

    new_admin = User(
        lab_id=lab_id,
        name=normalized_name,
        email=normalized_email,
        password_hash=hashed_password,
        role="Admin",
        phone=normalized_phone,
        is_active=True
    )

    try:
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)

    except Exception:
        db.rollback()

        return None, (
            "Unable to create admin account"
        )

    return new_admin, None


# =====================================================
# CREATE PATIENT
# =====================================================

def create_patient(
    db: Session,
    patient_data: PatientCreate
):
    email = normalize_email(
        str(patient_data.email)
    )

    name = normalize_name(
        patient_data.name
    )

    phone = normalize_phone(
        patient_data.phone
    )

    # -------------------------------------------------
    # Check laboratory
    # -------------------------------------------------

    lab = db.query(Lab).filter(
        Lab.lab_id == patient_data.lab_id,
        Lab.is_active == True
    ).first()

    if lab is None:
        return None, "Laboratory not found"

    # -------------------------------------------------
    # Check duplicate email
    # -------------------------------------------------

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        return None, (
            "A user with this email already exists"
        )

    # -------------------------------------------------
    # Hash password
    # -------------------------------------------------

    hashed_password = hash_password(
        patient_data.password
    )

    # -------------------------------------------------
    # Create patient
    # -------------------------------------------------

    new_patient = User(
        lab_id=patient_data.lab_id,
        name=name,
        email=email,
        password_hash=hashed_password,
        role="Patient",
        phone=phone,
        is_active=True
    )

    try:
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)

    except Exception:
        db.rollback()

        return None, (
            "Unable to create patient account"
        )

    return new_patient, None


# =====================================================
# DEACTIVATE STAFF
# =====================================================

def deactivate_staff(
    db: Session,
    staff_id: int,
    admin_lab_id: int
):
    staff = db.query(User).filter(
        User.user_id == staff_id,
        User.lab_id == admin_lab_id,
        User.role == "Staff",
        User.is_active == True
    ).first()

    if staff is None:
        return None, "Staff member not found"

    staff.is_active = False

    try:
        db.commit()
        db.refresh(staff)

    except Exception:
        db.rollback()

        return None, (
            "Unable to deactivate staff"
        )

    return staff, None


# =====================================================
# REACTIVATE STAFF
# =====================================================

def reactivate_staff(
    db: Session,
    staff_id: int,
    admin_lab_id: int
):
    staff = db.query(User).filter(
        User.user_id == staff_id,
        User.lab_id == admin_lab_id,
        User.role == "Staff",
        User.is_active == False
    ).first()

    if staff is None:
        return None, (
            "Inactive staff member not found"
        )

    staff.is_active = True

    try:
        db.commit()
        db.refresh(staff)

    except Exception:
        db.rollback()

        return None, (
            "Unable to reactivate staff"
        )

    return staff, None