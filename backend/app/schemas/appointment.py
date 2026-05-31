# app/schemas/appointment.py
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date, time, datetime


# ─────────────────────────────────────────────────────
# PlageHoraire
# ─────────────────────────────────────────────────────

class PlageHoraireCreate(BaseModel):
    jour_semaine: str           # "LUNDI", "MARDI"...
    heure_debut: time           # "09:00"
    heure_fin: time             # "12:00"
    duree_creneau_min: int = 30
    date_debut_validite: Optional[date] = None
    date_fin_validite: Optional[date] = None

    @field_validator("jour_semaine")
    @classmethod
    def valider_jour(cls, v: str) -> str:
        jours_valides = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"]
        v = v.upper().strip()
        if v not in jours_valides:
            raise ValueError(f"Jour invalide. Valeurs acceptées : {jours_valides}")
        return v

    @field_validator("heure_fin")
    @classmethod
    def fin_apres_debut(cls, heure_fin: time, info) -> time:
        heure_debut = info.data.get("heure_debut")
        if heure_debut and heure_fin <= heure_debut:
            raise ValueError("heure_fin doit être après heure_debut")
        return heure_fin


class PlageHoraireOut(BaseModel):
    id: str
    ophtalmologue_id: str
    jour_semaine: str
    heure_debut: time
    heure_fin: time
    duree_creneau_min: int
    actif: bool

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────
# Créneau
# ─────────────────────────────────────────────────────

class SlotResponse(BaseModel):
    creneau_id: str
    date: date
    heure_debut: time
    heure_fin: time
    ophtalmologue_id: str

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────
# Statut calendrier
# ─────────────────────────────────────────────────────

class CalendarStatusResponse(BaseModel):
    
    statuts: dict[str, str]  # ex: {"2025-06-02": "disponible", "2025-06-03": "indisponible"}


# ─────────────────────────────────────────────────────
# RendezVous
# ─────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    
    creneau_id: str
    ophtalmologue_id: str
    nom_patient: str
    prenom_patient: str
    telephone: str
    email_contact: EmailStr
    motif: Optional[str] = None
    source: Optional[str] = "web"

    @field_validator("nom_patient", "prenom_patient", "telephone")
    @classmethod
    def non_vide(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Ce champ est obligatoire et ne peut pas être vide")
        return v.strip()


class AppointmentResponse(BaseModel):
    """Réponse POST /appointments — inclut les tokens pour les liens email."""
    id: str
    creneau_id: str
    ophtalmologue_id: str
    nom_patient: Optional[str]
    prenom_patient: Optional[str]
    email_contact: Optional[str]
    telephone: Optional[str]
    statut: str
    source: str
    cancel_token: str          # → lien annuler dans l'email (Membre 3)
    token_modification: str    # → lien modifier dans l'email (Membre 3)
    token_expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────────────
# Membre 2 — Annulation & Modification
# ─────────────────────────────────────────────────────

class AppointmentDetail(BaseModel):
    """Réponse GET /appointments/{token}"""
    id: str
    nom_patient: Optional[str]
    prenom_patient: Optional[str]
    email_contact: Optional[str]
    telephone: Optional[str]
    statut: str
    source: str
    motif: Optional[str]
    token_expires_at: Optional[datetime]
    created_at: datetime
    # infos créneau
    creneau_id: str

    class Config:
        from_attributes = True


class AppointmentModify(BaseModel):
    """Body PUT /appointments/{token}/modifier"""
    nouveau_creneau_id: str


class AppointmentModifyResponse(BaseModel):
    """Réponse PUT /appointments/{token}/modifier"""
    id: str
    creneau_id: str
    statut: str
    token_expires_at: Optional[datetime]
    nom_patient: Optional[str]
    prenom_patient: Optional[str]

    class Config:
        from_attributes = True


class AnnulationResponse(BaseModel):
    """Réponse DELETE /appointments/{token}/annuler"""
    message: str
    rdv_id: str
    statut: str