import { Link, useLocation } from 'react-router-dom';

export default function ConfirmationPage() {
  const location = useLocation();
  const stored = sessionStorage.getItem('lastAppointment');
  const data = location.state || (stored ? JSON.parse(stored) : null);

  if (!data) {
    return (
      <>
        <h2 className="page-title">Confirmation</h2>
        <p className="empty-state">Aucune réservation récente trouvée.</p>
        <Link to="/" className="btn btn-primary">
          Prendre un rendez-vous
        </Link>
      </>
    );
  }

  const { appointment, doctor, slot, date, token } = data;
  const rdv = appointment || data;
  const accessToken =
    token || rdv.token_modification || rdv.cancel_token;

  return (
    <>
      <h2 className="page-title">Réservation confirmée</h2>
      <div className="alert alert-success">
        Votre rendez-vous a bien été enregistré. Un email de confirmation vous
        sera envoyé.
      </div>

      <dl className="summary-box">
        <dt>Patient</dt>
        <dd>{rdv.prenom_patient} {rdv.nom_patient}</dd>
        <dt>Email</dt>
        <dd>{rdv.email_contact}</dd>
        <dt>Téléphone</dt>
        <dd>{rdv.telephone}</dd>
        <dt>Médecin</dt>
        <dd>
          {doctor
            ? `Dr ${doctor.prenom} ${doctor.nom}`
            : 'Ophtalmologue'}
        </dd>
        <dt>Date</dt>
        <dd>{date || slot?.date}</dd>
        <dt>Heure</dt>
        <dd>
          {slot?.heure_debut?.slice?.(0, 5) || slot?.heure_debut}
          {' — '}
          {slot?.heure_fin?.slice?.(0, 5) || slot?.heure_fin}
        </dd>
        <dt>Statut</dt>
        <dd>{rdv.statut || 'EN_ATTENTE'}</dd>
      </dl>

      <div className="form-actions">
        {accessToken && (
          <Link to={`/rendez-vous/${accessToken}`} className="btn btn-primary">
            Voir les détails
          </Link>
        )}
        <Link to="/" className="btn btn-secondary">
          Nouveau rendez-vous
        </Link>
      </div>
    </>
  );
}
