from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User

from app.schemas.user import (
    StaffCreate,
    PatientCreate,
    UserResponse
)

from app.services.user_service import (
    create_staff_for_lab,
    create_patient,
    deactivate_staff,
    reactivate_staff
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =====================================================
# ADMIN - VIEW STAFF OF OWN LAB
# =====================================================

@router.get(
    "/staff",
    response_model=list[UserResponse]
)
def list_lab_staff(
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):
    staff = db.query(User).filter(
        User.lab_id == current_admin.lab_id,
        User.role == "Staff"
    ).order_by(
        User.user_id.asc()
    ).all()

    return staff


# =====================================================
# ADMIN - CREATE STAFF
# =====================================================

@router.post(
    "/staff",
    response_model=UserResponse
)
def create_staff(
    staff_data: StaffCreate,
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):
    staff, error = create_staff_for_lab(
        db=db,
        lab_id=current_admin.lab_id,
        staff_data=staff_data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    return staff


# =====================================================
# ADMIN - DEACTIVATE STAFF
# =====================================================

@router.put(
    "/staff/{staff_id}/deactivate",
    response_model=UserResponse
)
def deactivate_staff_account(
    staff_id: int,
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):
    staff, error = deactivate_staff(
        db=db,
        staff_id=staff_id,
        admin_lab_id=current_admin.lab_id
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error
        )

    return staff


# =====================================================
# ADMIN - REACTIVATE STAFF
# =====================================================

@router.put(
    "/staff/{staff_id}/reactivate",
    response_model=UserResponse
)
def reactivate_staff_account(
    staff_id: int,
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):
    staff, error = reactivate_staff(
        db=db,
        staff_id=staff_id,
        admin_lab_id=current_admin.lab_id
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error
        )

    return staff


# =====================================================
# PATIENT REGISTRATION
# =====================================================

@router.post(
    "/patient",
    response_model=UserResponse
)
def register_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db)
):
    patient, error = create_patient(
        db=db,
        patient_data=patient_data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    return patient
