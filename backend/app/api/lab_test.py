from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_role
)

from app.models.user import User

from app.schemas.lab_test import (
    LabTestCreate,
    LabTestUpdate,
    LabTestResponse
)

from app.services.lab_test_service import (
    create_lab_test,
    get_tests_by_lab,
    get_all_tests_by_lab,
    get_test_by_id,
    update_lab_test,
    deactivate_lab_test,
    reactivate_lab_test
)


router = APIRouter(
    prefix="/lab-tests",
    tags=["Laboratory Tests"]
)


# =========================================================
# ADMIN - ADD LAB TEST
# =========================================================

@router.post(
    "/",
    response_model=LabTestResponse
)
def add_lab_test(
    test_data: LabTestCreate,
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):

    test, error = create_lab_test(
        db,
        current_admin.lab_id,
        test_data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    return test


# =========================================================
# PUBLIC / PATIENT - VIEW ACTIVE TESTS BY LAB
# =========================================================

@router.get(
    "/lab/{lab_id}",
    response_model=list[LabTestResponse]
)
def list_lab_tests(
    lab_id: int,
    db: Session = Depends(get_db)
):

    return get_tests_by_lab(
        db,
        lab_id
    )


# =========================================================
# ADMIN - VIEW ALL TESTS
# ACTIVE + INACTIVE
# =========================================================

@router.get(
    "/admin/all",
    response_model=list[LabTestResponse]
)
def list_all_admin_tests(
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):

    return get_all_tests_by_lab(
        db,
        current_admin.lab_id
    )


# =========================================================
# ADMIN - UPDATE LAB TEST
# =========================================================

@router.put(
    "/{test_id}",
    response_model=LabTestResponse
)
def update_test(
    test_id: int,
    test_data: LabTestUpdate,
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):

    test, error = update_lab_test(
        db,
        current_admin.lab_id,
        test_id,
        test_data
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error
        )

    return test


# =========================================================
# ADMIN - DEACTIVATE LAB TEST
# =========================================================

@router.put(
    "/{test_id}/deactivate",
    response_model=LabTestResponse
)
def deactivate_test(
    test_id: int,
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):

    test, error = deactivate_lab_test(
        db,
        current_admin.lab_id,
        test_id
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error
        )

    return test


# =========================================================
# ADMIN - REACTIVATE LAB TEST
# =========================================================

@router.put(
    "/{test_id}/reactivate",
    response_model=LabTestResponse
)
def reactivate_test(
    test_id: int,
    current_admin: User = Depends(
        require_role("Admin")
    ),
    db: Session = Depends(get_db)
):

    test, error = reactivate_lab_test(
        db,
        current_admin.lab_id,
        test_id
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error
        )

    return test


# =========================================================
# GET SINGLE ACTIVE TEST
# =========================================================

@router.get(
    "/{test_id}",
    response_model=LabTestResponse
)
def get_lab_test(
    test_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    test = get_test_by_id(
        db,
        test_id,
        current_user.lab_id
    )

    if test is None:
        raise HTTPException(
            status_code=404,
            detail="Laboratory test not found"
        )

    return test
