import { Link, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-ms-canvas">
      <header className="border-b border-ms-border bg-ms-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-ms-blue">
            Задачі
          </Link>
          <span className="text-sm text-ms-muted">Microsoft To Do — стиль</span>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
