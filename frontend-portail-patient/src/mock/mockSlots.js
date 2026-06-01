function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function generateSlotsForDate(doctorId, dateStr) {
  const hours = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30'];
  return hours.map((heure_debut, index) => ({
    creneau_id: `slot-${doctorId}-${dateStr}-${index}`,
    date: dateStr,
    heure_debut,
    heure_fin: addMinutes(heure_debut, 30),
    ophtalmologue_id: doctorId,
  }));
}

export function getMockSlots(doctorId, date) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  const day = new Date(dateStr).getDay();
  if (day === 0 || day === 6) return [];
  return generateSlotsForDate(doctorId, dateStr);
}

export const mockSlots = generateSlotsForDate('doc-001', '2026-06-02');
