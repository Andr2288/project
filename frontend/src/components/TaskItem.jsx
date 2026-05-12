import { useEffect, useState } from "react";
import { formatDueUk, isOverdue } from "../utils/tasks.js";

const linkDone =
  "text-xs font-medium text-ms-blue underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-ms-blue/40 focus:ring-offset-1 rounded-sm";

const linkUndo =
  "text-xs font-medium text-ms-muted underline-offset-2 hover:text-ms-text hover:underline focus:outline-none focus:ring-2 focus:ring-ms-blue/40 focus:ring-offset-1 rounded-sm";

const linkDelete =
  "text-xs font-medium text-ms-muted underline-offset-2 hover:text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-1 rounded-sm";

export function TaskItem({ task, onToggle, onSaveTitle, onSaveDueDate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [dueDraft, setDueDraft] = useState(task.due_date ?? "");

  useEffect(() => {
    setDraft(task.title);
  }, [task.title, task.id]);

  useEffect(() => {
    setDueDraft(task.due_date ?? "");
  }, [task.due_date, task.id]);

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

  async function handleDueDateChange(e) {
    const value = e.target.value;
    const next = value || null;
    const prev = task.due_date ?? null;
    setDueDraft(value);
    if (next === prev) return;
    try {
      await onSaveDueDate(next);
    } catch {
      setDueDraft(task.due_date ?? "");
    }
  }

  const overdue = isOverdue(task.due_date, task.is_done);

  return (
    <li className="rounded-lg border border-ms-border bg-ms-white px-3 py-2.5 shadow-card">
      <div className="flex flex-col gap-2">
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
            className="w-full rounded border border-ms-border px-2 py-1.5 text-sm text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-2"
          />
        ) : (
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={startEdit}
              className={`min-w-0 flex-1 text-left text-sm leading-snug ${
                task.is_done ? "text-ms-muted line-through" : "text-ms-text"
              }`}
            >
              {task.title}
            </button>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
              {task.is_done ? (
                <button type="button" onClick={onToggle} className={linkUndo}>
                  Позначити як невиконану
                </button>
              ) : (
                <button type="button" onClick={onToggle} className={linkDone}>
                  Позначити як виконане
                </button>
              )}
              <button type="button" onClick={onDelete} className={linkDelete}>
                Видалити
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-ms-border/60 pt-2">
          <span className="text-[11px] text-ms-muted sm:text-xs">Термін:</span>
          <input
            id={`due-${task.id}`}
            type="date"
            value={dueDraft}
            onChange={handleDueDateChange}
            className="rounded border border-ms-border/80 bg-ms-canvas/30 px-1.5 py-0.5 text-[11px] text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-1 sm:text-xs"
          />
          {task.due_date ? (
            <span
              className={`text-[11px] sm:text-xs ${overdue ? "font-medium text-red-700" : "text-ms-muted"}`}
              title={overdue ? "Прострочено" : undefined}
            >
              {formatDueUk(task.due_date)}
              {overdue ? " · прострочено" : null}
            </span>
          ) : (
            <span className="text-[11px] text-ms-muted sm:text-xs">без дати</span>
          )}
        </div>
      </div>
    </li>
  );
}
