import { Link } from 'react-router-dom';
import { MapPin, Phone, ChevronRight } from 'lucide-react';

export default function CabinetCard({ cabinet }) {
  return (
    <article className="glass-card p-6 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200 group">
      <h3 className="text-lg font-display font-bold text-slate-800 mb-3 group-hover:text-azure-700 transition-colors">
        {cabinet.nom}
      </h3>
      <div className="space-y-2 mb-5">
        <p className="flex items-start gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-azure-400 mt-0.5 shrink-0" />
          {cabinet.adresse}
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Phone className="w-4 h-4 text-azure-400 shrink-0" />
          {cabinet.telephone}
        </p>
      </div>
      <Link
        to={`/cabinet/${cabinet.id}/doctors`}
        className="btn-primary w-full justify-center"
      >
        Choisir
        <ChevronRight className="w-4 h-4" />
      </Link>
    </article>
  );
}
