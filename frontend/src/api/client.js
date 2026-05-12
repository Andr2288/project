const base = import.meta.env.DEV ? "" : "http://127.0.0.1:5000";

export async function getHealth() {
  const res = await fetch(`${base}/api/health`);
  if (!res.ok) throw new Error("API недоступне");
  return res.json();
}
