/**
 * AppRoutes.jsx — Configuration des routes React Router
 *
 * Intégrez ce fichier dans votre App.jsx / main.jsx existant.
 * Les routes existantes (CabinetsPage, DoctorsPage) sont préservées.
 *
 * Parcours patient complet :
 *   /                           → CabinetsPage  (existant)
 *   /cabinet/:cabinetId/doctors → DoctorsPage   (existant)
 *   /doctors/:doctorId/agenda   → AgendaPage    ← nouveau
 *   /booking                    → BookingForm   ← nouveau
 *   /confirmation               → ConfirmationPage ← nouveau
 *   /appointment/:id            → AppointmentDetailsPage ← nouveau
 *   /appointment/:id/modify     → ModifyAppointmentPage ← nouveau
 *   /appointment/:id/cancel     → CancelAppointmentPage ← nouveau
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages existantes (adapter le chemin selon votre projet)
import CabinetsPage from "./pages/CabinetsPage";
import DoctorsPage from "./pages/DoctorsPage";

// Nouvelles pages
import AgendaPage from "./pages/AgendaPage";
import BookingForm from "./pages/BookingForm";
import ConfirmationPage from "./pages/ConfirmationPage";
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage";
import ModifyAppointmentPage from "./pages/ModifyAppointmentPage";
import CancelAppointmentPage from "./pages/CancelAppointmentPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Existants ── */}
        <Route path="/" element={<CabinetsPage />} />
        <Route path="/cabinet/:cabinetId/doctors" element={<DoctorsPage />} />

        {/* ── Nouveaux ── */}
        <Route path="/doctors/:doctorId/agenda" element={<AgendaPage />} />
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/appointment/:id" element={<AppointmentDetailsPage />} />
        <Route path="/appointment/:id/modify" element={<ModifyAppointmentPage />} />
        <Route path="/appointment/:id/cancel" element={<CancelAppointmentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
