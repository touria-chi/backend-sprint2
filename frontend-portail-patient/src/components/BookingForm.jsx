import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, getApiError } from '../services/api';

export default function BookingForm({ slot, doctorId, doctor, date }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', telephone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slot || !doctorId) {
      setError('Aucun créneau sélectionné.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointment = await appointmentsAPI.create({
        creneau_id: slot.creneau_id,
        ophtalmologue_id: doctorId,
        nom_patient: form.nom,
        prenom_patient: form.nom.split(' ')[0] || form.nom,
        telephone: form.telephone,
        email_contact: form.email,
        source: 'web',
      });

      const token = appointment.token_modification || appointment.cancel_token;
      sessionStorage.setItem('lastAppointment', JSON.stringify({
        appointment, doctor, slot, date, token,
      }));

      navigate('/confirmation', { state: { appointment, doctor, slot, date, token } });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-error">{error}</div>}

      <div>
        <label htmlFor="nom" className="form-label">Nom complet *</label>
        <input
          id="nom"
          name="nom"
          className="form-input"
          value={form.nom}
          onChange={handleChange}
          placeholder="Votre nom"
          required
        />
      </div>

      <div>
        <label htmlFor="telephone" className="form-label">Téléphone *</label>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          className="form-input"
          value={form.telephone}
          onChange={handleChange}
          placeholder="06 00 00 00 00"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="form-label">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-input"
          value={form.email}
          onChange={handleChange}
          placeholder="vous@email.com"
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
        {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
      </button>
    </form>
  );
}
