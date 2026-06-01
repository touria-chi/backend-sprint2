import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  cabinetsAPI,
  doctorsAPI,
  getApiError,
  slotsAPI,
} from '../services/api';

const JOURS_FR = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
const JOURS_LABEL = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_LABEL = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

function toMinutes(timeStr) {
  const [h, m] = String(timeStr).slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getDayNameFr(dateStr) {
  return JOURS_FR[new Date(`${dateStr}T12:00:00`).getDay()];
}

function buildSlotsFromPlage(plage) {
  if (!plage) return [];
  const duree = plage.duree_creneau_min || 30;
  let current = toMinutes(plage.heure_debut);
  const end = toMinutes(plage.heure_fin);
  const slots = [];
  while (current + duree <= end) {
    slots.push({
      heure_debut: minutesToTime(current),
      heure_fin: minutesToTime(current + duree),
      creneau_id: null,
      available: false,
    });
    current += duree;
  }
  return slots;
}

function mergeSlots(plageSlots, availableSlots) {
  const availableMap = new Map(
    availableSlots.map((s) => [formatTime(s.heure_debut), s])
  );
  return plageSlots.map((slot) => {
    const match = availableMap.get(slot.heure_debut);
    if (match) {
      return {
        ...slot,
        creneau_id: match.creneau_id,
        heure_fin: formatTime(match.heure_fin) || slot.heure_fin,
        available: true,
      };
    }
    return { ...slot, available: false };
  });
}

export default function AgendaPage() {
  const { cabinetId, doctorId } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const [doctor, setDoctor] = useState(null);
  const [cabinet, setCabinet] = useState(null);
  const [plages, setPlages] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [displaySlots, setDisplaySlots] = useState([]);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingInit(true);
    Promise.all([
      doctorsAPI.getById(doctorId),
      cabinetsAPI.getById(cabinetId),
      slotsAPI.getPlages(doctorId),
    ])
      .then(([doc, cab, plagesData]) => {
        setDoctor(doc);
        setCabinet(cab);
        setPlages(plagesData);
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingInit(false));
  }, [doctorId, cabinetId]);

  useEffect(() => {
    if (!doctorId) return;
    slotsAPI
      .getCalendarStatus(doctorId, viewYear, viewMonth)
      .then(setCalendarStatus)
      .catch((err) => setError(getApiError(err)));
  }, [doctorId, viewYear, viewMonth]);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    setLoadingSlots(true);
    slotsAPI
      .getAvailable(doctorId, selectedDate)
      .then(setAvailableSlots)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, selectedDate]);

  useEffect(() => {
    const jour = getDayNameFr(selectedDate);
    const plage = plages.find((p) => p.jour_semaine === jour);
    if (!plage) {
      setDisplaySlots(
        availableSlots.map((s) => ({
          creneau_id: s.creneau_id,
          heure_debut: formatTime(s.heure_debut),
          heure_fin: formatTime(s.heure_fin),
          available: true,
        }))
      );
      return;
    }
    setDisplaySlots(mergeSlots(buildSlotsFromPlage(plage), availableSlots));
  }, [plages, availableSlots, selectedDate]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1);
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startOffset; i += 1) days.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateStr,
        status: calendarStatus[dateStr] || (dateStr < todayISO() ? 'passe' : 'indisponible'),
      });
    }
    return days;
  }, [viewYear, viewMonth, calendarStatus]);

  const handleSlotClick = (slot) => {
    if (!slot.available || !slot.creneau_id) return;
    navigate(`/cabinet/${cabinetId}/doctors/${doctorId}/reservation`, {
      state: {
        doctor,
        cabinet,
        date: selectedDate,
        slot: {
          creneau_id: slot.creneau_id,
          heure_debut: slot.heure_debut,
          heure_fin: slot.heure_fin,
          date: selectedDate,
          ophtalmologue_id: doctorId,
        },
      },
    });
  };

  const formattedSelectedDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loadingInit) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-2 border-azure-200 border-t-azure-600 rounded-full animate-spin" />
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
        <span>Agenda</span>
      </nav>

      <div className="glass-card overflow-hidden shadow-card">
        <div className="bg-gradient-to-r from-azure-600 to-azure-700 px-6 py-6 text-white">
          <p className="text-azure-200 text-xs font-semibold uppercase tracking-wider mb-1">
            Prise de rendez-vous
          </p>
          <h2 className="text-2xl font-display font-bold">
            Dr {doctor?.prenom} {doctor?.nom}
          </h2>
          {doctor?.specialite && (
            <p className="text-azure-100 text-sm mt-1">{doctor.specialite}</p>
          )}
          {cabinet && (
            <p className="flex items-center gap-1.5 text-azure-100 text-sm mt-2">
              <MapPin className="w-3.5 h-3.5" />
              {cabinet.nom} — {cabinet.adresse}
            </p>
          )}
        </div>

        <div className="p-6">
          {error && <div className="alert-error mb-6">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendrier */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
                    else setViewMonth((m) => m - 1);
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-azure-50 text-slate-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-display font-bold text-slate-800">
                  {MOIS_LABEL[viewMonth - 1]} {viewYear}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
                    else setViewMonth((m) => m + 1);
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-azure-50 text-slate-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {JOURS_LABEL.map((j) => (
                  <div key={j} className="text-center text-xs font-semibold text-slate-400 py-1">
                    {j}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, index) => {
                  if (!item) return <div key={`e-${index}`} />;
                  const isSelected = item.dateStr === selectedDate;
                  const isPast = item.status === 'passe';
                  const isAvailable = item.status === 'disponible';

                  let btnClass = 'w-full aspect-square rounded-xl text-sm font-medium transition-all ';
                  if (isPast) btnClass += 'text-slate-300 cursor-not-allowed';
                  else if (isSelected) btnClass += 'bg-azure-600 text-white shadow-md';
                  else if (isAvailable) btnClass += 'text-slate-700 hover:bg-azure-50 border border-transparent hover:border-azure-200';
                  else btnClass += 'text-slate-300 cursor-not-allowed';

                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      disabled={isPast || !isAvailable}
                      className={btnClass}
                      onClick={() => isAvailable && setSelectedDate(item.dateStr)}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-azure-500" /> Disponible
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Complet
                </span>
              </div>
            </div>

            {/* Créneaux */}
            <div>
              <h3 className="font-display font-bold text-slate-800 mb-4 capitalize">
                {formattedSelectedDate}
              </h3>

              {loadingSlots && (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-azure-200 border-t-azure-600 rounded-full animate-spin" />
                </div>
              )}

              {!loadingSlots && displaySlots.length === 0 && (
                <p className="text-center text-slate-400 py-12 text-sm">
                  Aucun créneau disponible pour cette date.
                </p>
              )}

              {!loadingSlots && displaySlots.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {displaySlots.map((slot) => (
                    <button
                      key={`${slot.heure_debut}-${slot.creneau_id || 'x'}`}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => handleSlotClick(slot)}
                      className={slot.available ? 'slot-available' : 'slot-taken'}
                    >
                      {slot.heure_debut}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link to={`/cabinet/${cabinetId}/doctors`} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Retour aux médecins
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
