from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class LabCreate(BaseModel):
    lab_name: str
    description: str | None = None
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: EmailStr
    latitude: float | None = None
    longitude: float | None = None


class LabResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    lab_id: int
    lab_name: str
    description: str | None
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: EmailStr
    latitude: float | None
    longitude: float | None
    is_active: bool
    created_at: datetime
