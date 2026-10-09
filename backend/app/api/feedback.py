from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_role
)

from app.models.user import User

from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackResponse
)

from app.services.feedback_service import (
    create_feedback,
    get_patient_feedback,
    get_lab_feedback,
    get_feedback_by_id
)


router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"]
)


# =====================================================
# PATIENT - SUBMIT FEEDBACK
# =====================================================

@router.post(
    "/",
    response_model=FeedbackResponse
)
def submit_feedback(
    feedback_data: FeedbackCreate,
    current_patient: User = Depends(
        require_role("Patient")
    ),
    db: Session = Depends(get_db)
):
    feedback, error = create_feedback(
        db=db,
        patient=current_patient,
        feedback_data=feedback_data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    return feedback


# =====================================================
# PATIENT - MY FEEDBACK
# =====================================================

@router.get(
    "/my-feedback",
    response_model=list[FeedbackResponse]
)
def my_feedback(
    current_patient: User = Depends(
        require_role("Patient")
    ),
    db: Session = Depends(get_db)
):
    return get_patient_feedback(
        db=db,
        patient_id=current_patient.user_id,
        lab_id=current_patient.lab_id
    )


# =====================================================
# STAFF / ADMIN - LAB FEEDBACK
#
# IMPORTANT:
# This route must come before /{feedback_id}
# =====================================================

@router.get(
    "/lab/all",
    response_model=list[FeedbackResponse]
)
def lab_feedback(
    current_user: User = Depends(
        require_role("Staff", "Admin")
    ),
    db: Session = Depends(get_db)
):
    return get_lab_feedback(
        db=db,
        lab_id=current_user.lab_id
    )


# =====================================================
# GET ONE FEEDBACK
# =====================================================

@router.get(
    "/{feedback_id}",
    response_model=FeedbackResponse
)
def get_one_feedback(
    feedback_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------
    # Query is already restricted to current lab
    # -------------------------------------------------

    feedback = get_feedback_by_id(
        db=db,
        feedback_id=feedback_id,
        lab_id=current_user.lab_id
    )

    if feedback is None:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found"
        )

    # -------------------------------------------------
    # Patient → own feedback only
    # -------------------------------------------------

    if current_user.role == "Patient":

        if feedback.patient_id != current_user.user_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not allowed to "
                    "access this feedback"
                )
            )

    # -------------------------------------------------
    # Staff / Admin → same lab
    # -------------------------------------------------

    elif current_user.role in ["Staff", "Admin"]:

        if feedback.lab_id != current_user.lab_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not allowed to "
                    "access this feedback"
                )
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return feedback