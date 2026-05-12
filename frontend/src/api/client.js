const base = import.meta.env.DEV ? "" : "http://127.0.0.1:5000";

export const fetchDefaults = {
  credentials: "include",
};

export async function parseResponse(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || res.statusText || "Помилка запиту";
    throw new Error(msg);
  }
  return data;
}

export { base };

export async function getHealth() {
  const res = await fetch(`${base}/api/health`, { ...fetchDefaults });
  if (!res.ok) throw new Error("API недоступне");
  return res.json();
}
