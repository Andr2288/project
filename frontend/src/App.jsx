import { Link, Route, Routes } from "react-router-dom";

function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ms-text">Мої задачі</h1>
      <p className="mt-2 text-ms-muted">
        MVP: далі тут з&apos;явиться список задач з API.
      </p>
    </div>
  );
}

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
