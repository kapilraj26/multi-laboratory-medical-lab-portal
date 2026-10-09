from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class BookingCreate(BaseModel):
    lab_id: int
    test_id: int
    booking_date: date
    booking_time: str

class BookingStatusUpdate(BaseModel):
    status: str

class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    booking_id: int
    lab_id: int
    patient_id: int
    test_id: int
    booking_date: date
    booking_time: str
    status: str
    created_at: datetime