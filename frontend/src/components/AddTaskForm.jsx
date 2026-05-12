import { useState } from "react";

export function AddTaskForm({ onAdd, disabled }) {
  const [title, setTitle] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await onAdd(trimmed);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Нова задача…"
        disabled={disabled}
        className="min-w-0 flex-1 rounded-md border border-ms-border bg-ms-white px-3 py-2 text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
      />
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
