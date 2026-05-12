import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchActivity } from "../api/activity.js";
import { AlertModal } from "../components/Modal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDateTimeKyiv, toIsoUtcAttribute } from "../utils/datetime.js";

const ACTION_LABELS = {
  register: "Реєстрація",
  login: "Вхід",
  logout: "Вихід",
  password_reset_request: "Скидання пароля",
  password_reset_done: "Новий пароль",
  list_create: "Список",
  list_rename: "Список",
  list_delete: "Список",
  task_create: "Задача",
  task_update: "Задача",
  task_delete: "Задача",
};

export function HistoryPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [day, setDay] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchActivity({
        date: day || undefined,
        q: debouncedQ || undefined,
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не вдалося завантажити історію";
      if (msg === "Потрібна авторизація") {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [logout, navigate, day, debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  function resetFilters() {
    setDay("");
    setSearchInput("");
    setDebouncedQ("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ms-text">Історія дій</h1>
        </div>
        <Link
          to="/"
          className="shrink-0 rounded-md border border-ms-border bg-ms-white px-3 py-2 text-sm font-medium text-ms-text shadow-sm hover:bg-ms-surface"
        >
          До задач
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-ms-border bg-ms-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex w-full shrink-0 flex-col gap-1 sm:w-[13.5rem]">
            <label htmlFor="hist-day" className="text-xs font-medium leading-tight text-ms-muted">
              День (Europe/Kyiv)
            </label>
            <input
              id="hist-day"
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="h-10 w-full rounded-md border border-ms-border bg-ms-canvas/40 px-2 text-sm text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-2"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="hist-q" className="text-xs font-medium leading-tight text-ms-muted">
              Пошук у описі
            </label>
            <input
              id="hist-q"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="наприклад: задача, список…"
              className="h-10 w-full rounded-md border border-ms-border bg-ms-canvas/40 px-3 text-sm text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-2"
            />
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 shrink-0 rounded-md border border-ms-border bg-ms-white px-3 text-sm font-medium text-ms-text shadow-sm transition hover:bg-ms-canvas sm:ml-auto"
          >
            Скинути фільтри
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ms-muted">Завантаження…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-ms-border bg-ms-white px-4 py-8 text-center text-sm text-ms-muted shadow-card">
          Записів не знайдено. Змініть фільтри або виконайте дії зі списками та задачами — вони з’являться тут.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-ms-border rounded-lg border border-ms-border bg-ms-white shadow-card">
          {items.map((row) => (
            <li key={row.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
              <time
                className="shrink-0 text-xs text-ms-muted sm:w-36 sm:pt-0.5"
                dateTime={toIsoUtcAttribute(row.created_at)}
              >
                {formatDateTimeKyiv(row.created_at)}
              </time>
              <div className="min-w-0 flex-1">
                <span className="mb-1 inline-block rounded bg-ms-canvas px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ms-muted">
                  {ACTION_LABELS[row.action] ?? row.action}
                </span>
                <p className="text-sm text-ms-text">{row.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertModal open={Boolean(error)} message={error || ""} onClose={() => setError(null)} />
    </div>
  );
}
