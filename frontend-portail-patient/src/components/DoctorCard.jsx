import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, ChevronRight } from 'lucide-react';

export default function DoctorCard({ doctor, cabinetId }) {
  return (
    <article className="glass-card p-6 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-azure-100 to-azure-200 flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5 text-azure-600" />
        </div>
        <div>
          <h3 className="text-lg font-display font-bold text-slate-800">
            Dr {doctor.prenom} {doctor.nom}
          </h3>
          {doctor.specialite && (
            <p className="text-sm text-azure-600 font-medium mt-0.5">{doctor.specialite}</p>
          )}
        </div>
      </div>
      {doctor.email && (
        <p className="text-xs text-slate-400 mb-5">{doctor.email}</p>
      )}
      <Link
        to={`/cabinet/${cabinetId}/doctors/${doctor.id}/agenda`}
        className="btn-primary w-full justify-center"
      >
        <Calendar className="w-4 h-4" />
        Voir disponibilités
        <ChevronRight className="w-4 h-4" />
      </Link>
    </article>
  );
}
