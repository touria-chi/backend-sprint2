import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cabinetsAPI, doctorsAPI, getApiError } from '../services/api';
import DoctorCard from '../components/DoctorCard';

export default function DoctorsPage() {
  const { cabinetId } = useParams();
  const [cabinet, setCabinet] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      cabinetsAPI.getById(cabinetId),
      doctorsAPI.getByCabinet(cabinetId),
    ])
      .then(([cab, docs]) => {
        setCabinet(cab);
        setDoctors(docs);
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [cabinetId]);

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">Cabinets</Link>
        <span>/</span>
        <span>{cabinet?.nom || '...'}</span>
      </nav>

      <h2 className="page-title">Médecins disponibles</h2>
      <p className="page-subtitle">
        {cabinet ? cabinet.nom : 'Chargement...'} — choisissez un ophtalmologue.
      </p>

      {error && <div className="alert-error mb-6">{error}</div>}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-azure-200 border-t-azure-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && doctors.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          Aucun médecin disponible dans ce cabinet.
        </div>
      )}

      {!loading && doctors.length > 0 && (
        <div className="card-grid">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              cabinetId={cabinetId}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Retour aux cabinets
        </Link>
      </div>
    </>
  );
}
