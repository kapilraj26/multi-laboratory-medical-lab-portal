from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator
)


# =====================================================
# COMMON VALIDATION HELPERS
# =====================================================

def validate_name(value: str) -> str:

    value = value.strip()

    if len(value) < 2:
        raise ValueError(
            "Name must contain at least 2 characters"
        )

    if len(value) > 100:
        raise ValueError(
            "Name must not exceed 100 characters"
        )

    return value


def validate_password(value: str) -> str:

    if len(value) < 8:
        raise ValueError(
            "Password must contain at least 8 characters"
        )

    if len(value) > 72:
        raise ValueError(
            "Password must not exceed 72 characters"
        )

    if not any(char.isupper() for char in value):
        raise ValueError(
            "Password must contain at least one uppercase letter"
        )

    if not any(char.islower() for char in value):
        raise ValueError(
            "Password must contain at least one lowercase letter"
        )

    if not any(char.isdigit() for char in value):
        raise ValueError(
            "Password must contain at least one number"
        )

    return value


def validate_phone(value: str | None) -> str | None:

    if value is None:
        return None

    value = value.strip()

    if not value:
        return None

    if len(value) < 10 or len(value) > 15:
        raise ValueError(
            "Phone number must contain 10 to 15 characters"
        )

    if not value.replace("+", "").isdigit():
        raise ValueError(
            "Phone number must contain only digits and an optional +"
        )

    return value


# =====================================================
# GENERIC USER CREATE
# =====================================================

class UserCreate(BaseModel):

    lab_id: int = Field(
        gt=0
    )

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str

    role: Literal[
        "Patient",
        "Staff",
        "Admin"
    ]

    phone: str | None = None


    @field_validator("name")
    @classmethod
    def validate_user_name(
        cls,
        value: str
    ) -> str:

        return validate_name(value)


    @field_validator("password")
    @classmethod
    def validate_user_password(
        cls,
        value: str
    ) -> str:

        return validate_password(value)


    @field_validator("phone")
    @classmethod
    def validate_user_phone(
        cls,
        value: str | None
    ) -> str | None:

        return validate_phone(value)


# =====================================================
# STAFF CREATE
# =====================================================

class StaffCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str

    phone: str | None = None


    @field_validator("name")
    @classmethod
    def validate_staff_name(
        cls,
        value: str
    ) -> str:

        return validate_name(value)


    @field_validator("password")
    @classmethod
    def validate_staff_password(
        cls,
        value: str
    ) -> str:

        return validate_password(value)


    @field_validator("phone")
    @classmethod
    def validate_staff_phone(
        cls,
        value: str | None
    ) -> str | None:

        return validate_phone(value)


# =====================================================
# PATIENT CREATE
# =====================================================

class PatientCreate(BaseModel):

    lab_id: int = Field(
        gt=0
    )

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str

    phone: str | None = None


    @field_validator("name")
    @classmethod
    def validate_patient_name(
        cls,
        value: str
    ) -> str:

        return validate_name(value)


    @field_validator("password")
    @classmethod
    def validate_patient_password(
        cls,
        value: str
    ) -> str:

        return validate_password(value)


    @field_validator("phone")
    @classmethod
    def validate_patient_phone(
        cls,
        value: str | None
    ) -> str | None:

        return validate_phone(value)


# =====================================================
# USER RESPONSE
# =====================================================

class UserResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    user_id: int
    lab_id: int
    name: str
    email: EmailStr
    role: str
    phone: str | None
    is_active: bool
    created_at: datetime