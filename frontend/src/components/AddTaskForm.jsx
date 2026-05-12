import { useState } from "react";

export function AddTaskForm({ onAdd, disabled }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await onAdd(trimmed, dueDate || null);
    setTitle("");
    setDueDate("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Нова задача…"
        disabled={disabled}
        className="min-w-0 flex-1 rounded-md border border-ms-border bg-ms-white px-3 py-2 text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60 sm:min-w-[12rem]"
      />
      <div className="flex shrink-0 items-center gap-2">
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
      <button
        type="submit"
        disabled={disabled || !title.trim()}
        className="shrink-0 rounded-md bg-ms-blue px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ms-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        Додати
      </button>
    </form>
  );
}
