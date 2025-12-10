// src/api/auth.js
import { post } from "./client";

export async function login(email, password) {
  return post("/auth/login", {
    body: { email, password },
  });
}
