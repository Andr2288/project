import { base, fetchDefaults, parseResponse } from "./client.js";

export function fetchTasks(listId) {
  const q = new URLSearchParams({ list_id: String(listId) });
  return fetch(`${base}/api/tasks?${q}`, { ...fetchDefaults }).then(parseResponse);
}

export function createTask({ title, listId, dueDate }) {
  const body = { title, list_id: listId };
  if (dueDate) body.due_date = dueDate;
  return fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify(body),
  }).then(parseResponse);
}

export function patchTask(id, payload) {
  return fetch(`${base}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify(payload),
  }).then(parseResponse);
}

export function deleteTask(id) {
  return fetch(`${base}/api/tasks/${id}`, {
    method: "DELETE",
    ...fetchDefaults,
  }).then(parseResponse);
}
