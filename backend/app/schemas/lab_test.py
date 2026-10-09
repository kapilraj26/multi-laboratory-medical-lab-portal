from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator
)


def validate_text(value: str, field_name: str, max_length: int) -> str:
    value = value.strip()

    if not value:
        raise ValueError(f"{field_name} cannot be empty")

    if len(value) > max_length:
        raise ValueError(
            f"{field_name} must not exceed {max_length} characters"
        )

    return value


class LabTestCreate(BaseModel):
    test_name: str = Field(
        min_length=2,
        max_length=150
    )

    description: str | None = Field(
        default=None,
        max_length=1000
    )

    category: str = Field(
        min_length=2,
        max_length=100
    )

    price: float = Field(
        gt=0
    )

    duration_minutes: int = Field(
        gt=0,
        le=1440
    )

    @field_validator("test_name")
    @classmethod
    def validate_test_name(cls, value: str) -> str:
        return validate_text(
            value,
            "Test name",
            150
        )

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        return validate_text(
            value,
            "Category",
            100
        )

    @field_validator("description")
    @classmethod
    def validate_description(
        cls,
        value: str | None
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        if len(value) > 1000:
            raise ValueError(
                "Description must not exceed 1000 characters"
            )

        return value


class LabTestUpdate(BaseModel):
    test_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    description: str | None = Field(
        default=None,
        max_length=1000
    )

    category: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    price: float | None = Field(
        default=None,
        gt=0
    )

    duration_minutes: int | None = Field(
        default=None,
        gt=0,
        le=1440
    )

    @field_validator("test_name")
    @classmethod
    def validate_test_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        return validate_text(
            value,
            "Test name",
            150
        )

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str | None) -> str | None:
        if value is None:
            return None

        return validate_text(
            value,
            "Category",
            100
        )

    @field_validator("description")
    @classmethod
    def validate_description(
        cls,
        value: str | None
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        if len(value) > 1000:
            raise ValueError(
                "Description must not exceed 1000 characters"
            )

        return value


class LabTestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    test_id: int
    lab_id: int
    test_name: str
    description: str | None
    category: str
    price: float
    duration_minutes: int
    is_active: bool
    created_at: datetime