from sqlalchemy.orm import Session

from app.models.lab import Lab
from app.models.lab_test import LabTest
from app.schemas.lab_test import LabTestCreate, LabTestUpdate


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def normalize_test_name(value: str) -> str:
    return normalize_text(value).lower()


# =========================================================
# CREATE MEDICAL TEST
# =========================================================

def create_lab_test(
    db: Session,
    lab_id: int,
    test_data: LabTestCreate
):
    lab = db.query(Lab).filter(
        Lab.lab_id == lab_id,
        Lab.is_active == True
    ).first()

    if lab is None:
        return None, "Laboratory not found"

    test_name = normalize_text(test_data.test_name)
    category = normalize_text(test_data.category)

    # Case-insensitive duplicate check
    active_tests = db.query(LabTest).filter(
        LabTest.lab_id == lab_id,
        LabTest.is_active == True
    ).all()

    normalized_name = normalize_test_name(test_name)

    for existing_test in active_tests:
        if normalize_test_name(existing_test.test_name) == normalized_name:
            return None, "This test already exists in this laboratory"

    # Find highest test_id used by this laboratory
    last_test = db.query(LabTest).filter(
        LabTest.lab_id == lab_id
    ).order_by(
        LabTest.test_id.desc()
    ).first()

    next_test_id = (
        1
        if last_test is None
        else last_test.test_id + 1
    )

    new_test = LabTest(
        lab_id=lab_id,
        test_id=next_test_id,
        test_name=test_name,
        description=(
            test_data.description.strip()
            if test_data.description
            else None
        ),
        category=category,
        price=test_data.price,
        duration_minutes=test_data.duration_minutes,
        is_active=True
    )

    try:
        db.add(new_test)
        db.commit()
        db.refresh(new_test)

    except Exception:
        db.rollback()
        return None, "Unable to create laboratory test"

    return new_test, None


# =========================================================
# GET ACTIVE TESTS
# PUBLIC / PATIENT
# =========================================================

def get_tests_by_lab(
    db: Session,
    lab_id: int
):
    return db.query(LabTest).filter(
        LabTest.lab_id == lab_id,
        LabTest.is_active == True
    ).order_by(
        LabTest.test_id.asc()
    ).all()


# =========================================================
# GET ALL TESTS
# ADMIN
# Includes ACTIVE + INACTIVE
# =========================================================

def get_all_tests_by_lab(
    db: Session,
    lab_id: int
):
    return db.query(LabTest).filter(
        LabTest.lab_id == lab_id
    ).order_by(
        LabTest.test_id.asc()
    ).all()


# =========================================================
# GET SINGLE ACTIVE TEST
# =========================================================

def get_test_by_id(
    db: Session,
    test_id: int,
    lab_id: int
):
    return db.query(LabTest).filter(
        LabTest.test_id == test_id,
        LabTest.lab_id == lab_id,
        LabTest.is_active == True
    ).first()


# =========================================================
# UPDATE MEDICAL TEST
# =========================================================

def update_lab_test(
    db: Session,
    lab_id: int,
    test_id: int,
    test_data: LabTestUpdate
):
    test = db.query(LabTest).filter(
        LabTest.lab_id == lab_id,
        LabTest.test_id == test_id,
        LabTest.is_active == True
    ).first()

    if test is None:
        return None, "Laboratory test not found"

    # -----------------------------------------------------
    # Test name
    # -----------------------------------------------------

    if test_data.test_name is not None:

        new_test_name = normalize_text(
            test_data.test_name
        )

        normalized_new_name = normalize_test_name(
            new_test_name
        )

        existing_tests = db.query(LabTest).filter(
            LabTest.lab_id == lab_id,
            LabTest.is_active == True,
            LabTest.test_id != test_id
        ).all()

        for existing_test in existing_tests:
            if normalize_test_name(
                existing_test.test_name
            ) == normalized_new_name:
                return None, (
                    "Another active test with this "
                    "name already exists"
                )

        test.test_name = new_test_name

    # -----------------------------------------------------
    # Description
    # -----------------------------------------------------

    if test_data.description is not None:

        description = test_data.description.strip()

        test.description = (
            description
            if description
            else None
        )

    # -----------------------------------------------------
    # Category
    # -----------------------------------------------------

    if test_data.category is not None:

        test.category = normalize_text(
            test_data.category
        )

    # -----------------------------------------------------
    # Price
    # -----------------------------------------------------

    if test_data.price is not None:
        test.price = test_data.price

    # -----------------------------------------------------
    # Duration
    # -----------------------------------------------------

    if test_data.duration_minutes is not None:
        test.duration_minutes = (
            test_data.duration_minutes
        )

    try:
        db.commit()
        db.refresh(test)

    except Exception:
        db.rollback()
        return None, "Unable to update laboratory test"

    return test, None


# =========================================================
# DEACTIVATE MEDICAL TEST
# =========================================================

def deactivate_lab_test(
    db: Session,
    lab_id: int,
    test_id: int
):
    test = db.query(LabTest).filter(
        LabTest.lab_id == lab_id,
        LabTest.test_id == test_id,
        LabTest.is_active == True
    ).first()

    if test is None:
        return None, "Laboratory test not found"

    test.is_active = False

    try:
        db.commit()
        db.refresh(test)

    except Exception:
        db.rollback()
        return None, "Unable to deactivate laboratory test"

    return test, None


# =========================================================
# REACTIVATE MEDICAL TEST
# =========================================================

def reactivate_lab_test(
    db: Session,
    lab_id: int,
    test_id: int
):
    test = db.query(LabTest).filter(
        LabTest.lab_id == lab_id,
        LabTest.test_id == test_id
    ).first()

    if test is None:
        return None, "Medical test not found"

    if test.is_active:
        return None, "Medical test is already active"

    # -----------------------------------------------------
    # Prevent duplicate active test after reactivation
    # -----------------------------------------------------

    active_tests = db.query(LabTest).filter(
        LabTest.lab_id == lab_id,
        LabTest.is_active == True,
        LabTest.test_id != test_id
    ).all()

    normalized_name = normalize_test_name(
        test.test_name
    )

    for existing_test in active_tests:
        if normalize_test_name(
            existing_test.test_name
        ) == normalized_name:
            return None, (
                "Cannot reactivate this test because "
                "an active test with the same name already exists"
            )

    test.is_active = True

    try:
        db.commit()
        db.refresh(test)

    except Exception:
        db.rollback()
        return None, "Unable to reactivate laboratory test"

    return test, None
