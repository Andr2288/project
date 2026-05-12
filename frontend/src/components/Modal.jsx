import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

const btnBase =
  "rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ms-blue focus:ring-offset-2";

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const headingId = useId();
  const maxW = size === "lg" ? "max-w-lg" : "max-w-md";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрити вікно"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={`relative z-10 w-full ${maxW} rounded-lg border border-ms-border bg-ms-white shadow-xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ms-border px-4 py-3">
          {title ? (
            <h2 id={headingId} className="min-w-0 flex-1 text-lg font-semibold text-ms-text pr-2">
              {title}
            </h2>
          ) : (
            <span id={headingId} className="sr-only">
              Діалог
            </span>
          )}
          <button
            type="button"
            className="shrink-0 rounded p-1 text-ms-muted hover:bg-ms-surface hover:text-ms-text"
            aria-label="Закрити"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer ? <div className="border-t border-ms-border px-4 py-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export function AlertModal({ open, title = "Помилка", message, onClose, variant = "error" }) {
  const tone =
    variant === "success"
      ? "text-emerald-900"
      : variant === "info"
        ? "text-ms-text"
        : "text-red-800";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end">
          <button type="button" className={`${btnBase} bg-ms-blue text-white hover:bg-ms-blue-hover`} onClick={onClose}>
            Зрозуміло
          </button>
        </div>
      }
    >
      <p className={`text-sm ${tone}`}>{message}</p>
    </Modal>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Підтвердити",
  cancelLabel = "Скасувати",
  danger = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={`${btnBase} border border-ms-border bg-ms-white text-ms-text hover:bg-ms-surface`}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              danger
                ? `${btnBase} bg-red-600 text-white hover:bg-red-700`
                : `${btnBase} bg-ms-blue text-white hover:bg-ms-blue-hover`
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-ms-text">{message}</p>
    </Modal>
  );
}
