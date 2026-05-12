import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.js";
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
        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </div>
        ) : null}
        <button type="submit" className={btnPrimaryClass} disabled={busy || !username.trim()}>
          Запросити скидання
        </button>
      </form>

      {result ? (
        <div className="mt-6 rounded-lg border border-ms-border bg-ms-white p-4 text-sm text-ms-text shadow-card">
          <p className="font-medium">{result.message}</p>
          {result.note ? <p className="mt-2 text-ms-muted">{result.note}</p> : null}
          {result.reset_token ? (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ms-muted">Токен (демо)</p>
              <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded bg-ms-surface p-2 text-xs">
                {result.reset_token}
              </pre>
              {result.expires_at ? (
                <p className="mt-2 text-xs text-ms-muted">Дійсний до (серверний час): {result.expires_at}</p>
              ) : null}
              <p className="mt-3">
                <Link
                  to={`/reset-password?token=${encodeURIComponent(result.reset_token)}`}
                  className="font-medium text-ms-blue hover:underline"
                >
                  Перейти до введення нового пароля
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-ms-muted">
        <Link to="/login" className="font-medium text-ms-blue hover:underline">
          Назад до входу
        </Link>
      </p>
    </div>
  );
}
