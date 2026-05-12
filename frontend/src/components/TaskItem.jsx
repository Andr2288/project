import { useEffect, useState } from "react";
import { formatDueUk, isOverdue } from "../utils/tasks.js";

const linkDone =
  "text-xs font-medium text-ms-blue underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-ms-blue/40 focus:ring-offset-1 rounded-sm";

const linkUndo =
  "text-xs font-medium text-ms-muted underline-offset-2 hover:text-ms-text hover:underline focus:outline-none focus:ring-2 focus:ring-ms-blue/40 focus:ring-offset-1 rounded-sm";

const linkDelete =
  "text-xs font-medium text-ms-muted underline-offset-2 hover:text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-1 rounded-sm";

const PRI_OPTIONS = [
  { value: "low", label: "Низький" },
  { value: "medium", label: "Середній" },
  { value: "high", label: "Високий" },
];

function priorityAccent(priority) {
  if (priority === "high") return "border-l-4 border-l-amber-500";
  if (priority === "low") return "border-l-4 border-l-slate-300";
  return "border-l-4 border-l-ms-blue/40";
}

export function TaskItem({ task, onToggle, onSaveTitle, onSaveDueDate, onPatch, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [dueDraft, setDueDraft] = useState(task.due_date ?? "");
  const [tagDraft, setTagDraft] = useState("");

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

  async function handlePriorityChange(e) {
    const value = e.target.value;
    if (value === (task.priority || "medium")) return;
    await onPatch({ priority: value });
  }

  async function handleRemoveTag(name) {
    const next = (task.tags ?? []).filter((t) => t.name !== name).map((t) => t.name);
    await onPatch({ tags: next });
  }

  async function handleAddTag(e) {
    e.preventDefault();
    const name = tagDraft.trim();
    if (!name) return;
    const existing = new Set((task.tags ?? []).map((t) => t.name.toLowerCase()));
    if (existing.has(name.toLowerCase())) {
      setTagDraft("");
      return;
    }
    const next = [...(task.tags ?? []).map((t) => t.name), name];
    setTagDraft("");
    await onPatch({ tags: next });
  }

  const overdue = isOverdue(task.due_date, task.is_done);
  const pri = task.priority || "medium";

  return (
    <li
      className={`rounded-lg border border-ms-border bg-ms-white px-3 py-2.5 shadow-card pl-2 ${priorityAccent(pri)}`}
    >
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
              <div className="flex items-center gap-1">
                <span className="hidden text-[11px] text-ms-muted sm:inline">Пріоритет</span>
                <select
                  aria-label="Пріоритет задачі"
                  value={pri}
                  onChange={handlePriorityChange}
                  className="max-w-[7.5rem] rounded border border-ms-border/80 bg-ms-canvas/30 px-1 py-0.5 text-[11px] text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-1 sm:text-xs"
                >
                  {PRI_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
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

        <div className="flex flex-wrap items-center gap-1.5 border-t border-ms-border/60 pt-2">
          <span className="text-[11px] text-ms-muted sm:text-xs">Теги:</span>
          {(task.tags ?? []).length === 0 ? (
            <span className="text-[11px] text-ms-muted sm:text-xs">немає</span>
          ) : (
            (task.tags ?? []).map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full bg-ms-canvas px-2 py-0.5 text-[11px] text-ms-text ring-1 ring-ms-border/80 sm:text-xs"
              >
                {t.name}
                <button
                  type="button"
                  className="rounded px-0.5 text-ms-muted hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-ms-blue/40"
                  aria-label={`Прибрати тег ${t.name}`}
                  onClick={() => handleRemoveTag(t.name)}
                >
                  ×
                </button>
              </span>
            ))
          )}
          <form onSubmit={handleAddTag} className="ml-1 flex items-center gap-1">
            <input
              type="text"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              placeholder="+ тег"
              className="w-24 rounded border border-ms-border/80 bg-white px-1.5 py-0.5 text-[11px] text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-1 sm:w-28 sm:text-xs"
            />
            <button
              type="submit"
              className="rounded border border-ms-border bg-ms-surface px-1.5 py-0.5 text-[11px] font-medium text-ms-text hover:bg-ms-canvas sm:text-xs"
            >
              OK
            </button>
          </form>
        </div>

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
