import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.incident import Incident, IncidentUpdate
from app.schemas.incident import IncidentCreate, IncidentResponse, IncidentStatusPatch
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/incidents", tags=["Инциденты безопасности"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if severity_filter:
        query = query.filter(Incident.severity == severity_filter)
    return query.order_by(Incident.created_at.desc()).all()

@router.get("/map")
def get_map_markers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    incidents = db.query(Incident).filter(Incident.status != "closed").all()
    return [
        {
            "id": inc.id,
            "incident_number": inc.incident_number,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "coords": [inc.latitude, inc.longitude],
            "description": inc.description
        }
        for inc in incidents
    ]

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "dispatcher"]))
):
    num = f"INC-{datetime.utcnow().strftime('%Y-%m-%d')}-{uuid.uuid4().hex[:4].upper()}"
    new_inc = Incident(
        **payload.model_dump(),
        incident_number=num,
        reported_by_id=current_user.id,
        status="registered"
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)
    return new_inc

@router.patch("/{id}/status", response_model=IncidentResponse)
def change_status(
    id: int,
    payload: IncidentStatusPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "dispatcher"]))
):
    inc = db.query(Incident).filter(Incident.id == id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Инцидент не найден")

    log = IncidentUpdate(
        incident_id=inc.id,
        user_id=current_user.id,
        previous_status=inc.status,
        new_status=payload.new_status,
        comment=payload.comment
    )
    inc.status = payload.new_status
    if payload.new_status in ["resolved", "closed"]:
        inc.resolved_at = datetime.utcnow()

    db.add(log)
    db.commit()
    db.refresh(inc)
    return inc

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    inc = db.query(Incident).filter(Incident.id == id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Инцидент не найден")
    db.delete(inc)
    db.commit()
    return None

@router.put("/{id}", response_model=IncidentResponse)
def update_incident(
    id: int,
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "dispatcher"]))
):
    inc = db.query(Incident).filter(Incident.id == id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Инцидент не найден")
    
    for key, value in payload.model_dump().items():
        setattr(inc, key, value)
        
    db.commit()
    db.refresh(inc)
    return inc
