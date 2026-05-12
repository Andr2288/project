import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { btnPrimaryClass, fieldClass } from "../components/authStyles.js";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка входу");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-semibold text-ms-text">Вхід</h1>
      <p className="mt-1 text-sm text-ms-muted">Увійдіть, щоб керувати своїми задачами.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-username" className="mb-1 block text-sm font-medium text-ms-text">
            Ім&apos;я користувача
          </label>
          <input
            id="login-username"
            autoComplete="username"
            className={fieldClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={busy}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-ms-text">
            Пароль
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
        </div>
        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </div>
        ) : null}
        <button type="submit" className={btnPrimaryClass} disabled={busy || !username.trim() || !password}>
          Увійти
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ms-muted">
        Немає облікового запису?{" "}
        <Link to="/register" className="font-medium text-ms-blue hover:underline">
          Реєстрація
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-ms-muted">
        <Link to="/forgot-password" className="font-medium text-ms-blue hover:underline">
          Забули пароль?
        </Link>
      </p>
    </div>
  );
}
