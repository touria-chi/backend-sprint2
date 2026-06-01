/**
 * api.js — Service API centralisé
 * Tous les appels backend passent par ce fichier.
 * Aucun endpoint backend n'a été modifié.
 */
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE });

// ── Cabinets ──────────────────────────────────────
export const getCabinets = () => api.get("/cabinets/");
export const getCabinet = (id) => api.get(`/cabinets/${id}`);

// ── Médecins ──────────────────────────────────────
export const getDoctorsByCabinet = (cabinetId) =>
  api.get("/doctors", { params: { cabinet_id: cabinetId } });

export const getDoctor = (doctorId) => api.get(`/doctors/${doctorId}`);

// ── Agenda ────────────────────────────────────────
/**
 * GET /agenda/calendar-status
 * Retourne le statut de chaque jour du mois pour un médecin.
 */
export const getCalendarStatus = (doctorId, year, month) =>
  api.get("/agenda/calendar-status", {
    params: { doctor_id: doctorId, year, month },
  });

/**
 * GET /agenda/available-slots
 * Retourne les créneaux libres pour un médecin et une date.
 */
export const getAvailableSlots = (doctorId, date) =>
  api.get("/agenda/available-slots", {
    params: { doctor_id: doctorId, date },
  });

/**
 * POST /agenda/appointments
 * Crée un rendez-vous pour un patient anonyme.
 *
 * @param {Object} payload
 * @param {string} payload.creneau_id
 * @param {string} payload.ophtalmologue_id
 * @param {string} payload.nom_patient
 * @param {string} payload.prenom_patient
 * @param {string} payload.telephone
 * @param {string} payload.email_contact
 * @param {string} [payload.motif]
 * @param {string} [payload.source]  default "web"
 */
export const createAppointment = (payload) =>
  api.post("/agenda/appointments", payload);

export default api;
