// src/api/client.js
// Simple wrapper around fetch for the Community Meals backend.

const BASE_URL = "http://localhost:4000";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const message = data && data.error ? data.error : `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function get(path, options) {
  return request(path, { ...options, method: "GET" });
}

export function post(path, options) {
  return request(path, { ...options, method: "POST" });
}

export function patch(path, options) {
  return request(path, { ...options, method: "PATCH" });
}
