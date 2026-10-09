from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.lab import (
    LabResponse
)

from app.services.lab_service import (
    get_all_labs,
    get_lab_by_id
)


router = APIRouter(
    prefix="/labs",
    tags=["Laboratories"]
)


# =====================================================
# PUBLIC - LIST ACTIVE LABORATORIES
# =====================================================

@router.get(
    "/",
    response_model=list[LabResponse]
)
def list_labs(
    db: Session = Depends(get_db)
):

    return get_all_labs(db)


# =====================================================
# PUBLIC - GET ONE ACTIVE LABORATORY
# =====================================================

@router.get(
    "/{lab_id}",
    response_model=LabResponse
)
def get_lab(
    lab_id: int,
    db: Session = Depends(get_db)
):

    lab = get_lab_by_id(
        db,
        lab_id
    )

    if lab is None:

        raise HTTPException(
            status_code=404,
            detail="Laboratory not found"
        )

    return lab