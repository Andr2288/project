import { base, fetchDefaults, parseResponse } from "./client.js";

/**
 * @param {{ date?: string; q?: string }} [filters]
 * `date` — один день РРРР-ММ-ДД; якщо не передано, API повертає останні записи без обмеження датою.
 */
export function fetchActivity(filters = {}) {
  const params = new URLSearchParams();
  if (filters.date) params.set("date", filters.date);
  const trimmed = filters.q?.trim();
  if (trimmed) params.set("q", trimmed);
  const qs = params.toString();
  const url = qs ? `${base}/api/activity?${qs}` : `${base}/api/activity`;
  return fetch(url, { ...fetchDefaults }).then(parseResponse);
}
