// src/lib/authFetch.ts
import { logout, isTokenExpired } from "./jwtAuth";

export async function authFetch(
  router: { replace: (path: string) => void },
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const token = localStorage.getItem("authToken");

  if (!token || isTokenExpired(token)) {
    logout(router);
    throw new Error("Token missing/expired");
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    logout(router);
    throw new Error("Unauthorized (expired token)");
  }

  return res;
}
