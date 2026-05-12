import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal.jsx";

const btnBase =
  "rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ms-blue focus:ring-offset-2";

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

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(title: string, dueDate: string | null, priority: string, tags: string[]) => Promise<boolean>} props.onAdd
 * @param {boolean} props.disabled
 */
export function AddTaskModal({ open, onClose, onAdd, disabled }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tagsRaw, setTagsRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setTagsRaw("");
    setBusy(false);
    const t = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  async function submit() {
    const trimmed = title.trim();
    if (!trimmed || disabled || busy) return;
    setBusy(true);
    try {
      const tags = parseTagsInput(tagsRaw);
      const ok = await onAdd(trimmed, dueDate || null, priority, tags);
      if (ok) onClose();
    } finally {
      setBusy(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    void submit();
  }

  function requestClose() {
    if (busy) return;
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={requestClose}
      title="Нова задача"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            className={`${btnBase} border border-ms-border bg-ms-white text-ms-text hover:bg-ms-surface disabled:opacity-50`}
            onClick={requestClose}
          >
            Скасувати
          </button>
          <button
            type="button"
            disabled={disabled || busy || !title.trim()}
            className={`${btnBase} bg-ms-blue text-white hover:bg-ms-blue-hover disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={() => void submit()}
          >
            {busy ? "Збереження…" : "Створити"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="add-task-title" className="mb-1 block text-sm font-medium text-ms-text">
            Назва
          </label>
          <input
            ref={titleRef}
            id="add-task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Що потрібно зробити…"
            disabled={disabled || busy}
            autoComplete="off"
            className="w-full rounded-md border border-ms-border bg-ms-white px-3 py-2 text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="add-task-due" className="mb-1 block text-sm font-medium text-ms-text">
              Термін (дата)
            </label>
            <input
              id="add-task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={disabled || busy}
              className="w-full rounded-md border border-ms-border bg-ms-white px-2 py-2 text-sm text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="add-task-priority" className="mb-1 block text-sm font-medium text-ms-text">
              Пріоритет
            </label>
            <select
              id="add-task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={disabled || busy}
              className="w-full rounded-md border border-ms-border bg-ms-white px-2 py-2 text-sm text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
            >
              {PRI_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="add-task-tags" className="mb-1 block text-sm font-medium text-ms-text">
            Теги (через кому)
          </label>
          <input
            id="add-task-tags"
            type="text"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            disabled={disabled || busy}
            placeholder="наприклад: робота, терміново"
            className="w-full rounded-md border border-ms-border bg-ms-white px-3 py-2 text-sm text-ms-text shadow-sm outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
          />
        </div>
      </form>
    </Modal>
  );
}
