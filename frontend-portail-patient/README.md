# 📋 Intégration — Portail Patient Ophtalmologie

## Fichiers créés

| Fichier | Description |
|---|---|
| `AgendaPage.jsx` | Calendrier mensuel + créneaux horaires cliquables |
| `BookingForm.jsx` | Formulaire patient (nom, prénom, tel, email, motif) |
| `ConfirmationPage.jsx` | Page de succès après réservation |
| `AppointmentDetailsPage.jsx` | Détail d'un RDV avec boutons Modifier / Annuler |
| `ModifyAppointmentPage.jsx` | Ré-affichage de l'agenda pour choisir un nouveau créneau |
| `CancelAppointmentPage.jsx` | Confirmation d'annulation avec sélection de motif |
| `api.js` | Service Axios centralisé (aucun endpoint backend modifié) |
| `AppRoutes.jsx` | Configuration des routes React Router DOM |
| `DoctorCard_patch.jsx` | Patch pour ajouter le bouton RDV à DoctorsPage existant |

---

## Endpoints backend utilisés

```
GET  /cabinets/{cabinet_id}              → détail du cabinet
GET  /doctors/{doctor_id}               → détail du médecin
GET  /agenda/calendar-status            → statut des jours du mois
GET  /agenda/available-slots            → créneaux disponibles par date
POST /agenda/appointments               → créer un rendez-vous
```

> Aucun endpoint backend n'a été modifié ou créé.

---

## Endpoints manquants → mock frontend

| Fonctionnalité | Statut | Comportement |
|---|---|---|
| Modifier RDV (PATCH) | ❌ Non implémenté | Simulation frontend, mise à jour du state React |
| Annuler RDV (DELETE/PATCH) | ❌ Non implémenté | Simulation frontend, affichage "Annulé" |

---

## Instructions d'intégration

### 1. Dépendances (si manquantes)
```bash
npm install framer-motion lucide-react axios react-router-dom
```

### 2. Copier les fichiers
Placez tous les `.jsx` dans `src/pages/` et `api.js` dans `src/services/`.

### 3. Mettre à jour App.jsx
Remplacez ou fusionnez votre router existant avec `AppRoutes.jsx`.

### 4. Patcher DoctorsPage
Ajoutez le bouton "Prendre rendez-vous" dans chaque carte médecin
comme montré dans `DoctorCard_patch.jsx`.

### 5. Variable d'environnement
```env
# .env
VITE_API_URL=http://localhost:8000
```

---

## Parcours patient complet

```
[CabinetsPage] → [DoctorsPage] → [AgendaPage]
                                      ↓
                               [BookingForm]
                                      ↓
                           [ConfirmationPage]
                                      ↓
                        [AppointmentDetailsPage]
                           ↙               ↘
              [ModifyAppointmentPage]  [CancelAppointmentPage]
```

---

## Stack technique

- React + Vite
- Tailwind CSS (classes utilitaires)
- Framer Motion (animations)
- Lucide React (icônes)
- Axios (HTTP)
- React Router DOM v6
