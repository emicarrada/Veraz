/** Human-readable interval for UI copy (Spanish). */
export function formatIntervalSpanish(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));

  if (minutes < 60) {
    return minutes === 1 ? "1 minuto" : `${minutes} minutos`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return hours === 1 ? "1 hora" : `${hours} horas`;
  }

  return `${hours} h ${remainder} min`;
}
