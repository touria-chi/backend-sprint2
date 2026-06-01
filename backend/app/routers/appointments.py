# app/routers/appointments.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_type
import calendar
import uuid

from app.database import get_db
from app.models import Creneau, RendezVous, PlageHoraire
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentDetailResponse,
    AppointmentModify,
    SlotResponse,
    PlageHoraireCreate,
    PlageHoraireOut,
)
from app.utils.slots import get_available_slots
from sqlalchemy import or_

router = APIRouter(prefix="/agenda", tags=["Agenda numérique"])
patient_router = APIRouter(prefix="/appointments", tags=["Rendez-vous patient"])


def _find_rdv_by_token(db: Session, token: str) -> RendezVous | None:
    return db.query(RendezVous).filter(
        or_(
            RendezVous.cancel_token == token,
            RendezVous.token_modification == token,
            RendezVous.id == token,
        )
    ).first()


def _rdv_to_detail(rdv: RendezVous, creneau: Creneau | None) -> AppointmentDetailResponse:
    return AppointmentDetailResponse(
        id=rdv.id,
        creneau_id=rdv.creneau_id,
        ophtalmologue_id=rdv.ophtalmologue_id,
        nom_patient=rdv.nom_patient,
        prenom_patient=rdv.prenom_patient,
        email_contact=rdv.email_contact,
        telephone=rdv.telephone,
        statut=rdv.statut,
        source=rdv.source,
        cancel_token=rdv.cancel_token,
        token_modification=rdv.token_modification,
        token_expires_at=rdv.token_expires_at,
        created_at=rdv.created_at,
        rdv_date=creneau.date if creneau else None,
        heure_debut=creneau.heure_debut if creneau else None,
        heure_fin=creneau.heure_fin if creneau else None,
    )

@router.post(
    "/plages-horaires",
    response_model=PlageHoraireOut,
    status_code=201,
    summary="Créer une plage horaire",
    description="L'ophtalmologue définit ses disponibilités. Nécessaire avant de pouvoir avoir des créneaux."
)
def create_plage_horaire(
    doctor_id: str = Query(..., description="ID de l'ophtalmologue"),
    payload: PlageHoraireCreate = ...,
    db: Session = Depends(get_db)
):
    plage = PlageHoraire(
    id=str(uuid.uuid4()),
    ophtalmologue_id=doctor_id,
    jour_semaine=payload.jour_semaine,
    heure_debut=payload.heure_debut,
    heure_fin=payload.heure_fin,
    duree_creneau_min=payload.duree_creneau_min,
    actif=True,
    date_debut_validite=payload.date_debut_validite,
    date_fin_validite=payload.date_fin_validite,
)
    db.add(plage)
    db.commit()
    db.refresh(plage)
    return plage


@router.get(
    "/plages-horaires",
    response_model=list[PlageHoraireOut],
    summary="Lister les plages horaires d'un médecin"
)
def get_plages_horaires(
    doctor_id: str = Query(..., description="ID de l'ophtalmologue"),
    db: Session = Depends(get_db)
):
    return db.query(PlageHoraire).filter(
        PlageHoraire.ophtalmologue_id == doctor_id,
        PlageHoraire.actif == True
    ).all()


@router.get(
    "/available-slots",
    response_model=list[SlotResponse],
    summary="Créneaux disponibles",
    description=(
        "Retourne tous les créneaux libres pour un ophtalmologue et une date. "
        "Si les créneaux n'existent pas encore, ils sont générés automatiquement "
        "depuis la plage horaire du médecin."
    )
)
def get_slots(
    doctor_id: str = Query(..., description="ID de l'ophtalmologue"),
    date: date_type = Query(..., description="Date souhaitée (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    if date < date_type.today():
        raise HTTPException(
            status_code=400,
            detail="La date ne peut pas être dans le passé"
        )

    slots = get_available_slots(db, doctor_id, date)

    return [
        SlotResponse(
            creneau_id=str(s.id),
            date=s.date,
            heure_debut=s.heure_debut,
            heure_fin=s.heure_fin,
            ophtalmologue_id=str(s.ophtalmologue_id)
        )
        for s in slots
    ]

@router.get(
    "/calendar-status",
    summary="Statut des jours du mois",
    description=(
        "Retourne pour chaque jour du mois : disponible (vert), "
        "indisponible (rouge), ou passe. "
        "Utilisé par le frontend React pour colorier le calendrier."
    )
)
def get_calendar_status(
    doctor_id: str = Query(..., description="ID de l'ophtalmologue"),
    year: int = Query(..., description="Année ex: 2025"),
    month: int = Query(..., description="Mois ex: 6"),
    db: Session = Depends(get_db)
):
    _, nb_jours = calendar.monthrange(year, month)
    result = {}

    for jour in range(1, nb_jours + 1):
        d = date_type(year, month, jour)

        if d < date_type.today():
            result[str(d)] = "passe"
            continue

        slots = get_available_slots(db, doctor_id, d)
        result[str(d)] = "disponible" if slots else "indisponible"

    return result

@router.post(
    "/appointments",
    response_model=AppointmentResponse,
    status_code=201,
    summary="Créer un rendez-vous",
    description=(
        "Réserve un créneau pour un patient web anonyme. "
        "Le créneau est bloqué dans la même transaction. "
        "Les tokens cancel_token et token_modification sont auto-générés."
    )
)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db)
):
    # 1. Vérifier que le créneau existe et appartient à ce médecin
    creneau = db.query(Creneau).filter(
        Creneau.id == payload.creneau_id,
        Creneau.ophtalmologue_id == payload.ophtalmologue_id,
    ).first()

    if not creneau:
        raise HTTPException(
            status_code=404,
            detail="Créneau introuvable pour ce médecin"
        )

    if not creneau.disponible or creneau.statut_affichage != "DISPONIBLE":
        raise HTTPException(
            status_code=409,
            detail="Ce créneau n'est plus disponible"
        )
        
    rdv_existant = db.query(RendezVous).filter(
        RendezVous.creneau_id == payload.creneau_id,
        RendezVous.statut != "ANNULE"
    ).first()

    if rdv_existant:
        raise HTTPException(
            status_code=409,
            detail="Un rendez-vous existe déjà sur ce créneau"
        )

    rdv_datetime = datetime.combine(creneau.date, creneau.heure_debut)
    token_expires = rdv_datetime - timedelta(hours=24)


    rdv = RendezVous(
        id=str(uuid.uuid4()),
        creneau_id=payload.creneau_id,
        ophtalmologue_id=payload.ophtalmologue_id,
        nom_patient=payload.nom_patient,
        prenom_patient=payload.prenom_patient,
        telephone=payload.telephone,
        email_contact=str(payload.email_contact),
        motif=payload.motif,
        source=payload.source or "web",
        statut="EN_ATTENTE",
        token_expires_at=token_expires,
    )
    db.add(rdv)

    creneau.disponible = False
    creneau.statut_affichage = "COMPLET"
    db.commit()
    db.refresh(rdv)

    return rdv


@patient_router.get(
    "/{token}",
    response_model=AppointmentDetailResponse,
    summary="Consulter un rendez-vous via token",
)
def get_appointment_by_token(token: str, db: Session = Depends(get_db)):
    rdv = _find_rdv_by_token(db, token)
    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
    creneau = db.query(Creneau).filter(Creneau.id == rdv.creneau_id).first()
    return _rdv_to_detail(rdv, creneau)


@patient_router.put(
    "/{token}/modifier",
    response_model=AppointmentDetailResponse,
    summary="Modifier le créneau d'un rendez-vous",
)
def modify_appointment(
    token: str,
    payload: AppointmentModify,
    db: Session = Depends(get_db),
):
    rdv = _find_rdv_by_token(db, token)
    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")

    if rdv.statut == "ANNULE":
        raise HTTPException(status_code=409, detail="Ce rendez-vous est annulé")

    nouveau_creneau = db.query(Creneau).filter(
        Creneau.id == payload.creneau_id,
        Creneau.ophtalmologue_id == rdv.ophtalmologue_id,
    ).first()

    if not nouveau_creneau:
        raise HTTPException(status_code=404, detail="Créneau introuvable")

    if not nouveau_creneau.disponible or nouveau_creneau.statut_affichage != "DISPONIBLE":
        raise HTTPException(status_code=409, detail="Ce créneau n'est plus disponible")

    ancien_creneau = db.query(Creneau).filter(Creneau.id == rdv.creneau_id).first()
    if ancien_creneau:
        ancien_creneau.disponible = True
        ancien_creneau.statut_affichage = "DISPONIBLE"

    rdv.creneau_id = payload.creneau_id
    rdv.statut = "REPORTE"

    nouveau_creneau.disponible = False
    nouveau_creneau.statut_affichage = "COMPLET"

    db.commit()
    db.refresh(rdv)
    return _rdv_to_detail(rdv, nouveau_creneau)


@patient_router.delete(
    "/{token}/annuler",
    summary="Annuler un rendez-vous",
)
def cancel_appointment(token: str, db: Session = Depends(get_db)):
    rdv = _find_rdv_by_token(db, token)
    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")

    if rdv.statut == "ANNULE":
        raise HTTPException(status_code=409, detail="Ce rendez-vous est déjà annulé")

    creneau = db.query(Creneau).filter(Creneau.id == rdv.creneau_id).first()
    if creneau:
        creneau.disponible = True
        creneau.statut_affichage = "DISPONIBLE"

    rdv.statut = "ANNULE"
    db.commit()

    return {"message": "Rendez-vous annulé avec succès"}
