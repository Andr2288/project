/** SQLite `datetime('now')` — UTC без суфікса; для UI показуємо Europe/Kyiv. */
const KYIV = "Europe/Kyiv";

/**
 * Парсить рядок з API як UTC, якщо немає явного offset / Z.
 * @param {string|null|undefined} value
 * @returns {Date|null}
 */
export function parseServerUtc(value) {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (!s) return null;
  if (/[zZ]$/.test(s)) return new Date(s);
  if (/[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  const m = s.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?$/,
  );
  if (!m) return new Date(s);
  const sec = m[3] ?? "00";
  const ms = m[4] ? `.${String(m[4]).padEnd(3, "0").slice(0, 3)}` : "";
  return new Date(`${m[1]}T${m[2]}:${sec}${ms}Z`);
}

export function formatDateTimeKyiv(value) {
  const d = parseServerUtc(value);
  if (!d || Number.isNaN(d.getTime())) return value == null ? "" : String(value);
  return d.toLocaleString("uk-UA", {
    timeZone: KYIV,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Атрибут dateTime для <time> — повний ISO в UTC. */
export function toIsoUtcAttribute(value) {
  const d = parseServerUtc(value);
  if (!d || Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** Поточна календарна дата в Києві (YYYY-MM-DD) для порівняння з due_date. */
export function todayISO() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KYIV,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const p = (t) => parts.find((x) => x.type === t)?.value ?? "";
  return `${p("year")}-${p("month")}-${p("day")}`;
}

/** Календарний due_date (YYYY-MM-DD) українською, у часовій зоні Києва. */
export function formatDueUk(iso) {
  if (!iso) return "";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (!y || !mo || !da) return "";
  const d = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0));
  return d.toLocaleDateString("uk-UA", {
    timeZone: KYIV,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
