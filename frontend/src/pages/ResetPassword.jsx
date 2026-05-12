import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth.js";
import { AlertModal } from "../components/Modal.jsx";
import { btnPrimaryClass, fieldClass } from "../components/authStyles.js";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const tokenFromUrl = useMemo(() => params.get("token") || "", [params]);

  const [token, setToken] = useState(tokenFromUrl);

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const data = await resetPassword({ token, newPassword });
      setMessage(data.message || "Готово.");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка скидання");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-semibold text-ms-text">Новий пароль</h1>
      <p className="mt-1 text-sm text-ms-muted">Вставте токен з демо-відповіді API та задайте новий пароль.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="reset-token" className="mb-1 block text-sm font-medium text-ms-text">
            Токен
          </label>
          <textarea
            id="reset-token"
            rows={3}
            className={`${fieldClass} font-mono text-xs`}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={busy}
          />
        </div>
        <div>
          <label htmlFor="reset-password" className="mb-1 block text-sm font-medium text-ms-text">
            Новий пароль
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={busy}
          />
        </div>
        <button type="submit" className={btnPrimaryClass} disabled={busy || !token.trim() || !newPassword}>
          Зберегти новий пароль
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ms-muted">
        <Link to="/login" className="font-medium text-ms-blue hover:underline">
          На сторінку входу
        </Link>
      </p>

      <AlertModal open={Boolean(error)} message={error || ""} onClose={() => setError(null)} />
      <AlertModal
        open={Boolean(message)}
        title="Успіх"
        message={message || ""}
        onClose={() => setMessage(null)}
        variant="success"
      />
    </div>
  );
}
