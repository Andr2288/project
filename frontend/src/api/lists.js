import { base, fetchDefaults, parseResponse } from "./client.js";

export function fetchLists() {
  return fetch(`${base}/api/lists`, { ...fetchDefaults }).then(parseResponse);
}

export function createList({ name }) {
  return fetch(`${base}/api/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify({ name }),
  }).then(parseResponse);
}

export function patchList(id, { name }) {
  return fetch(`${base}/api/lists/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify({ name }),
  }).then(parseResponse);
}

export function deleteList(id) {
  return fetch(`${base}/api/lists/${id}`, {
    method: "DELETE",
    ...fetchDefaults,
  }).then(parseResponse);
}
