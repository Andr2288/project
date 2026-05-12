import { useEffect, useState } from "react";

export function TaskItem({ task, onToggle, onSaveTitle, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  useEffect(() => {
    setDraft(task.title);
  }, [task.title, task.id]);

  function startEdit() {
    setDraft(task.title);
    setEditing(true);
  }

  async function commitEdit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(task.title);
      setEditing(false);
      return;
    }
    if (trimmed !== task.title) {
      await onSaveTitle(trimmed);
    }
    setEditing(false);
  }

  return (
    <li className="flex items-start gap-3 rounded-lg border border-ms-border bg-ms-white px-3 py-3 shadow-card">
      <input
        type="checkbox"
        checked={task.is_done}
        onChange={onToggle}
        className="mt-1 h-4 w-4 rounded border-ms-border text-ms-blue focus:ring-ms-blue"
        aria-label={task.is_done ? "Позначити як невиконану" : "Позначити як виконану"}
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.target.blur();
              if (e.key === "Escape") {
                setDraft(task.title);
                setEditing(false);
              }
            }}
            autoFocus
            className="w-full rounded border border-ms-border px-2 py-1 text-sm text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-2"
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className={`text-left text-sm ${
              task.is_done ? "text-ms-muted line-through" : "text-ms-text"
            }`}
          >
            {task.title}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        Видалити
      </button>
    </li>
  );
}
