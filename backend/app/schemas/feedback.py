from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FeedbackCreate(BaseModel):
    booking_id: int

    rating: int = Field(
        ge=1,
        le=5
    )

    comments: str | None = None


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback_id: int
    lab_id: int
    patient_id: int
    booking_id: int
    rating: int
    comments: str | None
    created_at: datetime
