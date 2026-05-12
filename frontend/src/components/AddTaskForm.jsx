import { useState } from "react";

const PRI_OPTIONS = [
  { value: "low", label: "Низький" },
  { value: "medium", label: "Середній" },
  { value: "high", label: "Високий" },
];

function parseTagsInput(raw) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AddTaskForm({ onAdd, disabled }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tagsRaw, setTagsRaw] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const tags = parseTagsInput(tagsRaw);
    await onAdd(trimmed, dueDate || null, priority, tags);
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setTagsRaw("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Нова задача…"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-md border border-ms-border bg-ms-white px-3 py-2 text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60 sm:min-w-[12rem]"
        />
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label htmlFor="new-task-due" className="whitespace-nowrap text-xs text-ms-muted sm:text-sm">
            Термін
          </label>
          <input
            id="new-task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={disabled}
            className="rounded-md border border-ms-border bg-ms-white px-2 py-2 text-sm text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label htmlFor="new-task-priority" className="whitespace-nowrap text-xs text-ms-muted sm:text-sm">
            Пріоритет
          </label>
          <select
            id="new-task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={disabled}
            className="rounded-md border border-ms-border bg-ms-white px-2 py-2 text-sm text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
          >
            {PRI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={disabled || !title.trim()}
          className="shrink-0 rounded-md bg-ms-blue px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ms-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Додати
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="new-task-tags" className="text-xs text-ms-muted sm:text-sm">
          Теги (через кому, наприклад: робота, терміново)
        </label>
        <input
          id="new-task-tags"
          type="text"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          disabled={disabled}
          placeholder="опційно"
          className="w-full max-w-xl rounded-md border border-ms-border bg-ms-white px-3 py-2 text-sm text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
        />
      </div>
    </form>
  );
}
