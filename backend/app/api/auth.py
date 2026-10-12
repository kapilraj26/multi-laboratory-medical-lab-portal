from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.schemas.auth import LoginRequest
from app.services.auth_service import login_user
from app.models.user import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    result, error = login_user(
        db,
        login_data.email,
        login_data.password
    )

    if error:
        raise HTTPException(
            status_code=401,
            detail=error
        )

    return result


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "user_id": current_user.user_id,
        "lab_id": current_user.lab_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "phone": current_user.phone,
        "is_active": current_user.is_active
    }


@router.get("/staff-test")
def staff_test(
    current_user: User = Depends(
        require_role("Staff")
    )
):
    return {
        "success": True,
        "message": "Staff access successful",
        "user_id": current_user.user_id,
        "lab_id": current_user.lab_id,
        "role": current_user.role
    }


@router.get("/admin-test")
def admin_test(
    current_user: User = Depends(
        require_role("Admin")
    )
):
    return {
        "success": True,
        "message": "Admin access successful",
        "user_id": current_user.user_id,
        "lab_id": current_user.lab_id,
        "role": current_user.role
    }


@router.get("/patient-test")
def patient_test(
    current_user: User = Depends(
        require_role("Patient")
    )
):
    return {
        "success": True,
        "message": "Patient access successful",
        "user_id": current_user.user_id,
        "lab_id": current_user.lab_id,
        "role": current_user.role
    }
