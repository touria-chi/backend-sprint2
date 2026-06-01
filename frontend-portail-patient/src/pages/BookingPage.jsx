import { Link, useLocation, useParams } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

export default function BookingPage() {
  const { cabinetId, doctorId } = useParams();
  const location = useLocation();
  const { slot, doctor, date } = location.state || {};

  if (!slot || !doctor) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="alert-error mb-6 justify-center">
          Aucun créneau sélectionné. Veuillez choisir un créneau.
        </div>
        <Link
          to={`/cabinet/${cabinetId}/doctors/${doctorId}/agenda`}
          className="btn-primary"
        >
          Retour à l&apos;agenda
        </Link>
      </div>
    );
  }

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">Cabinets</Link>
        <span>/</span>
        <Link to={`/cabinet/${cabinetId}/doctors`}>Médecins</Link>
        <span>/</span>
        <Link to={`/cabinet/${cabinetId}/doctors/${doctorId}/agenda`}>Agenda</Link>
        <span>/</span>
        <span>Réservation</span>
      </nav>

      <h2 className="page-title">Confirmer votre rendez-vous</h2>

      <div className="glass-card p-6 mb-6">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Médecin</dt>
            <dd className="font-semibold text-slate-800">Dr {doctor.prenom} {doctor.nom}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</dt>
            <dd className="font-semibold text-slate-800">{date}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Heure</dt>
            <dd className="font-semibold text-azure-600">
              {slot.heure_debut?.slice?.(0, 5) || slot.heure_debut}
              {' — '}
              {slot.heure_fin?.slice?.(0, 5) || slot.heure_fin}
            </dd>
          </div>
        </dl>
      </div>

      <div className="glass-card p-6">
        <BookingForm slot={slot} doctorId={doctorId} doctor={doctor} date={date} />
      </div>
    </>
  );
}
