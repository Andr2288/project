import { base, fetchDefaults, parseResponse } from "./client.js";

export function fetchTags() {
  return fetch(`${base}/api/tags`, { ...fetchDefaults }).then(parseResponse);
}
