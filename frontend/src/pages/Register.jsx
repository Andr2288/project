import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertModal } from "../components/Modal.jsx";
import { btnPrimaryClass, fieldClass } from "../components/authStyles.js";
import { useAuth } from "../context/AuthContext.jsx";

export function RegisterPage() {
  const { user, register } = useAuth();
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
      await register(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка реєстрації");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-semibold text-ms-text">Реєстрація</h1>
      <p className="mt-1 text-sm text-ms-muted">Мінімум 3 символи в імені та 6 у паролі.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="reg-username" className="mb-1 block text-sm font-medium text-ms-text">
            Ім&apos;я користувача
          </label>
          <input
            id="reg-username"
            autoComplete="username"
            className={fieldClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={busy}
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-ms-text">
            Пароль
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
        </div>
        <button type="submit" className={btnPrimaryClass} disabled={busy || !username.trim() || !password}>
          Створити обліковий запис
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ms-muted">
        Вже є обліковий запис?{" "}
        <Link to="/login" className="font-medium text-ms-blue hover:underline">
          Увійти
        </Link>
      </p>

      <AlertModal open={Boolean(error)} message={error || ""} onClose={() => setError(null)} />
    </div>
  );
}
