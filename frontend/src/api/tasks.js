import { base, fetchDefaults, parseResponse } from "./client.js";

export function fetchTasks() {
  return fetch(`${base}/api/tasks`, { ...fetchDefaults }).then(parseResponse);
}

export function createTask({ title }) {
  return fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify({ title }),
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
