from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReportCreate(BaseModel):
    booking_id: int
    result: str | None = None
    report_file: str | None = None
    remarks: str | None = None


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_id: int
    booking_id: int
    lab_id: int
    patient_id: int
    test_id: int
    result: str | None
    report_file: str | None
    remarks: str | None
    uploaded_by: int
    created_at: datetime