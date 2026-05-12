import { base, fetchDefaults, parseResponse } from "./client.js";

export function fetchTasks(listId, filters = {}) {
  const q = new URLSearchParams({ list_id: String(listId) });
  const trimmed = filters.q?.trim();
  if (trimmed) q.set("q", trimmed);
  if (filters.status && filters.status !== "all") q.set("status", filters.status);
  if (filters.tagId != null && filters.tagId !== "") q.set("tag_id", String(filters.tagId));
  return fetch(`${base}/api/tasks?${q}`, { ...fetchDefaults }).then(parseResponse);
}

export function createTask({ title, listId, dueDate, priority, tags }) {
  const body = { title, list_id: listId };
  if (dueDate) body.due_date = dueDate;
  if (priority) body.priority = priority;
  if (tags && tags.length) body.tags = tags;
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
