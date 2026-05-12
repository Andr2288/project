import { base, fetchDefaults, parseResponse } from "./client.js";

export async function fetchMe() {
  const res = await fetch(`${base}/api/auth/me`, { ...fetchDefaults });
  return parseResponse(res);
}

export async function login({ username, password }) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify({ username, password }),
  });
  return parseResponse(res);
}

export async function register({ username, password }) {
  const res = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify({ username, password }),
  });
  return parseResponse(res);
}

export async function logout() {
  const res = await fetch(`${base}/api/auth/logout`, {
    method: "POST",
    ...fetchDefaults,
  });
  return parseResponse(res);
}

export async function forgotPassword({ username }) {
  const res = await fetch(`${base}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify({ username }),
  });
  return parseResponse(res);
}

export async function resetPassword({ token, newPassword }) {
  const res = await fetch(`${base}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...fetchDefaults,
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  return parseResponse(res);
}
