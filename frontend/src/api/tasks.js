const base = import.meta.env.DEV ? "" : "http://127.0.0.1:5000";

async function parseResponse(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || res.statusText || "Помилка запиту";
    throw new Error(msg);
  }
  return data;
}

export function fetchTasks() {
  return fetch(`${base}/api/tasks`).then(parseResponse);
}

export function createTask({ title }) {
  return fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  }).then(parseResponse);
}

export function patchTask(id, payload) {
  return fetch(`${base}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(parseResponse);
}

export function deleteTask(id) {
  return fetch(`${base}/api/tasks/${id}`, {
    method: "DELETE",
  }).then(parseResponse);
}
