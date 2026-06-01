import { Routes, Route, Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import CabinetsPage from './pages/CabinetsPage';
import DoctorsPage from './pages/DoctorsPage';
import AgendaPage from './pages/AgendaPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AppointmentPage from './pages/AppointmentPage';
import ModifyAppointmentPage from './pages/ModifyAppointmentPage';
import CancelAppointmentPage from './pages/CancelAppointmentPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-azure-50/30 to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-soft">
        <div className="page-container py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 to-azure-700 flex items-center justify-center shadow-card group-hover:shadow-glow transition-shadow">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-slate-800 leading-tight">
                Portail Patient
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Prise de rendez-vous ophtalmologique
              </p>
            </div>
          </Link>
        </div>
      </header>

      <main className="page-container pb-12">
        <Routes>
          <Route path="/" element={<CabinetsPage />} />
          <Route path="/cabinet/:cabinetId/doctors" element={<DoctorsPage />} />
          <Route
            path="/cabinet/:cabinetId/doctors/:doctorId/agenda"
            element={<AgendaPage />}
          />
          <Route
            path="/cabinet/:cabinetId/doctors/:doctorId/reservation"
            element={<BookingPage />}
          />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/rendez-vous/:token" element={<AppointmentPage />} />
          <Route path="/rendez-vous/:token/modifier" element={<ModifyAppointmentPage />} />
          <Route path="/rendez-vous/:token/annuler" element={<CancelAppointmentPage />} />
        </Routes>
      </main>
    </div>
  );
}
