import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.js";
import { AlertModal, Modal } from "../components/Modal.jsx";
import { btnPrimaryClass, fieldClass } from "../components/authStyles.js";

export function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const data = await forgotPassword({ username });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка запиту");
    } finally {
      setBusy(false);
    }
  }

  function closeResult() {
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold text-ms-text">Відновлення пароля (демо)</h1>
      <p className="mt-2 text-sm text-ms-muted">
        У реальному застосунку на email надіслали б посилання. Тут токен показується на екрані лише для
        навчальної симуляції.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="forgot-username" className="mb-1 block text-sm font-medium text-ms-text">
            Ім&apos;я користувача
          </label>
          <input
            id="forgot-username"
            autoComplete="username"
            className={fieldClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={busy}
          />
        </div>
        <button type="submit" className={btnPrimaryClass} disabled={busy || !username.trim()}>
          Запросити скидання
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ms-muted">
        <Link to="/login" className="font-medium text-ms-blue hover:underline">
          Назад до входу
        </Link>
      </p>

      <AlertModal open={Boolean(error)} message={error || ""} onClose={() => setError(null)} />

      <Modal
        open={Boolean(result)}
        onClose={closeResult}
        title={result?.reset_token ? "Демо: скидання пароля" : "Результат"}
        size="lg"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            {result?.reset_token ? (
              <Link
                to={`/reset-password?token=${encodeURIComponent(result.reset_token)}`}
                className="text-sm font-medium text-ms-blue hover:underline"
                onClick={closeResult}
              >
                Перейти до нового пароля
              </Link>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="rounded-md bg-ms-blue px-4 py-2 text-sm font-medium text-white hover:bg-ms-blue-hover"
              onClick={closeResult}
            >
              Зрозуміло
            </button>
          </div>
        }
      >
        {result ? (
          <div className="space-y-3 text-sm text-ms-text">
            <p className="font-medium">{result.message}</p>
            {result.note ? <p className="text-ms-muted">{result.note}</p> : null}
            {result.reset_token ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ms-muted">Токен (демо)</p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded border border-ms-border bg-ms-surface p-2 text-xs">
                  {result.reset_token}
                </pre>
                {result.expires_at ? (
                  <p className="mt-2 text-xs text-ms-muted">Дійсний до (серверний час): {result.expires_at}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
