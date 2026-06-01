import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { appointmentsAPI, getApiError, slotsAPI } from '../services/api';
import SlotButton from '../components/SlotButton';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ModifyAppointmentPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const doctorId = appointment?.ophtalmologue_id;

  useEffect(() => {
    if (!token) {
      setError('Lien de modification invalide.');
      setLoading(false);
      return;
    }

    appointmentsAPI
      .getByToken(token)
      .then((data) => {
        setAppointment(data);
        if (data.date) setDate(data.date);
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!doctorId) return;

    setLoadingSlots(true);
    setSelectedSlot(null);
    slotsAPI
      .getAvailable(doctorId, date)
      .then(setSlots)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Veuillez sélectionner un nouveau créneau.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await appointmentsAPI.modify(token, {
        creneau_id: selectedSlot.creneau_id,
      });

      sessionStorage.setItem('lastAppointment', JSON.stringify({
        appointment: updated,
        slot: selectedSlot,
        date,
        token,
      }));

      setSuccess(true);
      setTimeout(() => navigate('/confirmation'), 2000);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <>
        <h2 className="page-title">Modifier le rendez-vous</h2>
        <div className="alert alert-error">Lien invalide ou expiré.</div>
        <Link to="/" className="btn btn-primary">Accueil</Link>
      </>
    );
  }

  return (
    <>
      <h2 className="page-title">Modifier le rendez-vous</h2>

      {loading && <p className="loading">Chargement...</p>}
      {error && !success && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Rendez-vous modifié avec succès. Redirection...
        </div>
      )}

      {!loading && appointment && !success && (
        <>
          <dl className="summary-box">
            <dt>Rendez-vous actuel</dt>
            <dd>
              {appointment.prenom_patient} {appointment.nom_patient}
              {' — '}
              {appointment.date || 'date à confirmer'}
            </dd>
          </dl>

          <form onSubmit={handleSubmit}>
            <div className="date-picker-row">
              <label htmlFor="date">Nouvelle date :</label>
              <input
                id="date"
                type="date"
                value={date}
                min={todayISO()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {loadingSlots && <p className="loading">Chargement des créneaux...</p>}

            {!loadingSlots && slots.length === 0 && (
              <p className="empty-state">Aucun créneau disponible pour cette date.</p>
            )}

            {!loadingSlots && slots.length > 0 && (
              <div className="slots-grid">
                {slots.map((slot) => (
                  <SlotButton
                    key={slot.creneau_id}
                    slot={slot}
                    selected={selectedSlot?.creneau_id === slot.creneau_id}
                    onSelect={setSelectedSlot}
                  />
                ))}
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !selectedSlot}
              >
                {submitting ? 'Modification...' : 'Confirmer le nouveau créneau'}
              </button>
              <Link to={`/rendez-vous/${token}`} className="btn btn-secondary">
                Annuler
              </Link>
            </div>
          </form>
        </>
      )}
    </>
  );
}
