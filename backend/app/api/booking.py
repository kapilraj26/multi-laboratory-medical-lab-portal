from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User

from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingStatusUpdate
)

from app.services.booking_service import (
    create_booking,
    get_patient_bookings,
    get_booking_by_id,
    get_lab_bookings,
    update_booking_status
)


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


# =====================================================
# PATIENT - CREATE BOOKING
# =====================================================

@router.post(
    "/",
    response_model=BookingResponse
)
def add_booking(
    booking_data: BookingCreate,
    current_patient: User = Depends(
        require_role("Patient")
    ),
    db: Session = Depends(get_db)
):
    if booking_data.lab_id != current_patient.lab_id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot create a booking "
                "for another laboratory"
            )
        )

    booking, error = create_booking(
        db=db,
        patient=current_patient,
        booking_data=booking_data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    return booking


# =====================================================
# PATIENT - MY BOOKINGS
# =====================================================

@router.get(
    "/my-bookings",
    response_model=list[BookingResponse]
)
def my_bookings(
    current_patient: User = Depends(
        require_role("Patient")
    ),
    db: Session = Depends(get_db)
):
    return get_patient_bookings(
        db=db,
        patient_id=current_patient.user_id,
        lab_id=current_patient.lab_id
    )


# =====================================================
# STAFF / ADMIN - VIEW LAB BOOKINGS
#
# IMPORTANT:
# This route must come BEFORE /{booking_id}
# =====================================================

@router.get(
    "/lab/all",
    response_model=list[BookingResponse]
)
def lab_bookings(
    current_user: User = Depends(
        require_role("Staff", "Admin")
    ),
    db: Session = Depends(get_db)
):
    return get_lab_bookings(
        db=db,
        lab_id=current_user.lab_id
    )


# =====================================================
# PATIENT - VIEW ONE OWN BOOKING
# =====================================================

@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(
    booking_id: int,
    current_patient: User = Depends(
        require_role("Patient")
    ),
    db: Session = Depends(get_db)
):
    booking = get_booking_by_id(
        db=db,
        booking_id=booking_id,
        patient_id=current_patient.user_id,
        lab_id=current_patient.lab_id
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    return booking


# =====================================================
# STAFF / ADMIN - UPDATE BOOKING STATUS
# =====================================================

@router.put(
    "/{booking_id}/status",
    response_model=BookingResponse
)
def change_booking_status(
    booking_id: int,
    status_data: BookingStatusUpdate,
    current_user: User = Depends(
        require_role("Staff", "Admin")
    ),
    db: Session = Depends(get_db)
):
    booking, error = update_booking_status(
        db=db,
        booking_id=booking_id,
        lab_id=current_user.lab_id,
        new_status=status_data.status
    )

    if error:
        if error == "Invalid booking status":
            raise HTTPException(
                status_code=400,
                detail=error
            )

        if error == "Invalid booking status transition":
            raise HTTPException(
                status_code=400,
                detail=error
            )

        raise HTTPException(
            status_code=404,
            detail=error
        )

    return booking