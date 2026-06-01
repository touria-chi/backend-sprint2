import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { cabinetsAPI, getApiError } from '../services/api';
import CabinetCard from '../components/CabinetCard';

export default function CabinetsPage() {
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cabinetsAPI
      .getAll()
      .then(setCabinets)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-azure-600 text-sm font-medium mb-2">
          <Building2 className="w-4 h-4" />
          Étape 1 — Choisir un cabinet
        </div>
        <h2 className="page-title">Trouvez votre cabinet</h2>
        <p className="page-subtitle">
          Sélectionnez un cabinet pour consulter les médecins disponibles.
        </p>
      </div>

      {error && <div className="alert-error mb-6">{error}</div>}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-azure-200 border-t-azure-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && cabinets.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          Aucun cabinet disponible pour le moment.
        </div>
      )}

      {!loading && cabinets.length > 0 && (
        <div className="card-grid">
          {cabinets.map((cabinet) => (
            <CabinetCard key={cabinet.id} cabinet={cabinet} />
          ))}
        </div>
      )}
    </>
  );
}
