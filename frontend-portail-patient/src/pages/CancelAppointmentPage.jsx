import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { appointmentsAPI, getApiError } from '../services/api';

export default function CancelAppointmentPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Lien d\'annulation invalide.');
      setLoading(false);
      return;
    }

    appointmentsAPI
      .getByToken(token)
      .then(setAppointment)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCancel = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await appointmentsAPI.cancel(token);
      sessionStorage.removeItem('lastAppointment');
      setCancelled(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <>
        <h2 className="page-title">Annuler le rendez-vous</h2>
        <div className="alert alert-error">Lien invalide ou expiré.</div>
        <Link to="/" className="btn btn-primary">Accueil</Link>
      </>
    );
  }

  return (
    <>
      <h2 className="page-title">Annuler le rendez-vous</h2>

      {loading && <p className="loading">Chargement...</p>}
      {error && !cancelled && <div className="alert alert-error">{error}</div>}

      {cancelled && (
        <>
          <div className="alert alert-success">
            Votre rendez-vous a été annulé avec succès.
          </div>
          <Link to="/" className="btn btn-primary">
            Retour à l&apos;accueil
          </Link>
        </>
      )}

      {!loading && appointment && !cancelled && (
        <>
          <div className="alert alert-info">
            Êtes-vous sûr de vouloir annuler ce rendez-vous ?
          </div>

          <dl className="summary-box">
            <dt>Patient</dt>
            <dd>{appointment.prenom_patient} {appointment.nom_patient}</dd>
            <dt>Email</dt>
            <dd>{appointment.email_contact}</dd>
            <dt>Statut</dt>
            <dd>{appointment.statut}</dd>
          </dl>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancel}
              disabled={submitting}
            >
              {submitting ? 'Annulation...' : 'Confirmer l\'annulation'}
            </button>
            <Link to={`/rendez-vous/${token}`} className="btn btn-secondary">
              Retour
            </Link>
          </div>
        </>
      )}
    </>
  );
}
