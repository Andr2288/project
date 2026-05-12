import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { createList, deleteList, fetchLists, patchList } from "../api/lists.js";
import { AlertModal, ConfirmModal } from "./Modal.jsx";

function listLinkClass(active) {
  return [
    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition",
    active
      ? "bg-ms-blue/10 font-medium text-ms-blue"
      : "text-ms-text hover:bg-ms-surface",
  ].join(" ");
}

export function ListSidebar() {
  const { listId: activeListId } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchLists();
      setLists(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося завантажити списки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setError(null);
    try {
      const lst = await createList({ name });
      setNewName("");
      const fresh = await fetchLists();
      setLists(fresh);
      navigate(`/list/${lst.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося створити список");
    }
  }

  async function confirmDelete() {
    if (deleteTargetId == null) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    setError(null);
    try {
      await deleteList(id);
      const fresh = await fetchLists();
      setLists(fresh);
      if (String(id) === String(activeListId)) {
        const fallback = fresh[0]?.id;
        if (fallback) navigate(`/list/${fallback}`, { replace: true });
        else navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося видалити список");
    }
  }

  async function commitRename(id) {
    const name = editDraft.trim();
    setEditingId(null);
    if (!name) {
      await load();
      return;
    }
    setError(null);
    try {
      await patchList(id, { name });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося перейменувати");
    }
  }

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-ms-border bg-ms-white">
      <div className="shrink-0 border-b border-ms-border px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ms-muted">Списки</p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-2">
        {loading ? (
          <p className="px-2 py-3 text-sm text-ms-muted">Завантаження…</p>
        ) : (
          <ul className="space-y-1">
            {lists.map((lst) => (
              <li key={lst.id}>
                {editingId === lst.id ? (
                  <input
                    autoFocus
                    className="w-full rounded border border-ms-border px-2 py-1.5 text-sm"
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onBlur={() => commitRename(lst.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();
                      if (e.key === "Escape") {
                        setEditingId(null);
                        load();
                      }
                    }}
                  />
                ) : (
                  <div className="group flex items-center gap-1">
                    <NavLink
                      to={`/list/${lst.id}`}
                      className={({ isActive }) => listLinkClass(isActive)}
                    >
                      <span className="min-w-0 flex-1 truncate">{lst.name}</span>
                    </NavLink>
                    <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        title="Перейменувати"
                        className="rounded p-1 text-ms-muted hover:bg-ms-surface hover:text-ms-text"
                        onClick={() => {
                          setEditingId(lst.id);
                          setEditDraft(lst.name);
                        }}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        title="Видалити"
                        className="rounded p-1 text-ms-muted hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDeleteTargetId(lst.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>
      <div className="shrink-0 border-t border-ms-border p-2">
        <form onSubmit={handleCreate} className="space-y-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Новий список…"
            className="w-full rounded-md border border-ms-border px-2 py-1.5 text-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="w-full rounded-md border border-ms-border bg-ms-surface py-1.5 text-xs font-medium text-ms-text hover:bg-ms-canvas disabled:opacity-50"
          >
            Додати список
          </button>
        </form>
      </div>

      <ConfirmModal
        open={deleteTargetId != null}
        title="Видалити список?"
        message="Усі задачі в цьому списку буде видалено без можливості відновлення."
        confirmLabel="Видалити"
        cancelLabel="Скасувати"
        danger
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
      <AlertModal open={Boolean(error)} message={error || ""} onClose={() => setError(null)} />
    </aside>
  );
}
