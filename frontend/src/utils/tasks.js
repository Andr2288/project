/** Сортування як на бекенді: спочатку з датою (найближчі дедлайни), без дати — в кінці. */
export function sortTasksLikeApi(tasks) {
  return [...tasks].sort((a, b) => {
    const an = a.due_date == null ? 1 : 0;
    const bn = b.due_date == null ? 1 : 0;
    if (an !== bn) return an - bn;
    if (a.due_date != null && b.due_date != null && a.due_date !== b.due_date) {
      return a.due_date.localeCompare(b.due_date);
    }
    return a.id - b.id;
  });
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDueUk(iso) {
  if (!iso) return "";
  const [y, mo, da] = iso.split("-").map(Number);
  return new Date(y, mo - 1, da).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function isOverdue(iso, isDone) {
  if (isDone || !iso) return false;
  return iso < todayISO();
}
