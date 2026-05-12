import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { ForgotPasswordPage } from "./pages/ForgotPassword.jsx";
import { Home } from "./pages/Home.jsx";
import { LoginPage } from "./pages/Login.jsx";
import { RegisterPage } from "./pages/Register.jsx";
import { ResetPasswordPage } from "./pages/ResetPassword.jsx";

function AppHeader() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b border-ms-border bg-ms-white shadow-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-ms-blue">
          Задачі
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-ms-muted sm:inline">Microsoft To Do — стиль</span>
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-ms-text">{user.username}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-ms-border bg-ms-surface px-3 py-1.5 font-medium text-ms-text hover:bg-ms-canvas"
              >
                Вийти
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="font-medium text-ms-blue hover:underline">
                Увійти
              </Link>
              <Link to="/register" className="font-medium text-ms-blue hover:underline">
                Реєстрація
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-ms-canvas">
      <AppHeader />
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
