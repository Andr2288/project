import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLists } from "../api/lists.js";

export function ListRedirect() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Завантаження…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lists = await fetchLists();
        if (cancelled) return;
        if (!lists.length) {
          setMsg("Немає списків. Оновіть сторінку або увійдіть знову.");
          return;
        }
        navigate(`/list/${lists[0].id}`, { replace: true });
      } catch (e) {
        if (!cancelled) setMsg(e instanceof Error ? e.message : "Помилка");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-ms-muted">{msg}</div>
  );
}
