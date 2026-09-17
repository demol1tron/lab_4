from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    incident_type: str
    severity: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    description: str
    railway_object_id: int

class IncidentStatusPatch(BaseModel):
    new_status: str
    comment: str

class IncidentUpdateLog(BaseModel):
    id: int
    user_id: int
    previous_status: Optional[str]
    new_status: str
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentResponse(BaseModel):
    id: int
    incident_number: str
    title: str
    incident_type: str
    severity: str
    status: str
    latitude: float
    longitude: float
    description: str
    railway_object_id: int
    reported_by_id: int
    occurred_at: datetime
    resolved_at: Optional[datetime]
    created_at: datetime
    updates: List[IncidentUpdateLog] = []

    class Config:
        from_attributes = True
