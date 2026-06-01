import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { appointmentsAPI, getApiError } from '../services/api';

function formatTime(value) {
  if (!value) return '—';
  return String(value).slice(0, 5);
}

export default function AppointmentPage() {
  const { token } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Lien de rendez-vous invalide.');
      setLoading(false);
      return;
    }

    appointmentsAPI
      .getByToken(token)
      .then(setAppointment)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <>
        <h2 className="page-title">Rendez-vous</h2>
        <div className="alert alert-error">Lien invalide ou expiré.</div>
        <Link to="/" className="btn btn-primary">Accueil</Link>
      </>
    );
  }

  return (
    <>
      <h2 className="page-title">Détails du rendez-vous</h2>

      {loading && <p className="loading">Chargement du rendez-vous...</p>}
      {error && !loading && <div className="alert alert-error">{error}</div>}

      {!loading && appointment && (
        <>
          <dl className="summary-box">
            <dt>Patient</dt>
            <dd>{appointment.prenom_patient} {appointment.nom_patient}</dd>
            <dt>Email</dt>
            <dd>{appointment.email_contact}</dd>
            <dt>Téléphone</dt>
            <dd>{appointment.telephone}</dd>
            {appointment.motif && (
              <>
                <dt>Motif</dt>
                <dd>{appointment.motif}</dd>
              </>
            )}
            <dt>Date</dt>
            <dd>{appointment.date || appointment.slot?.date || '—'}</dd>
            <dt>Heure</dt>
            <dd>
              {formatTime(appointment.heure_debut || appointment.slot?.heure_debut)}
              {' — '}
              {formatTime(appointment.heure_fin || appointment.slot?.heure_fin)}
            </dd>
            <dt>Statut</dt>
            <dd>{appointment.statut}</dd>
          </dl>

          <div className="form-actions">
            <Link
              to={`/rendez-vous/${token}/modifier`}
              className="btn btn-secondary"
            >
              Modifier
            </Link>
            <Link
              to={`/rendez-vous/${token}/annuler`}
              className="btn btn-danger"
            >
              Annuler
            </Link>
            <Link to="/" className="btn btn-primary">
              Accueil
            </Link>
          </div>
        </>
      )}
    </>
  );
}
