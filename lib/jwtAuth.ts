// src/lib/jwtAuth.ts
export function parseJwt(token: string) {
  try {
    const payloadPart = token.split(".")[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token: string): number | null {
  const payload = parseJwt(token);
  if (!payload?.exp) return null; // exp is seconds since epoch
  return payload.exp * 1000;
}

export function isTokenExpired(token: string): boolean {
  const expMs = getTokenExpiryMs(token);
  if (!expMs) return true; // if missing exp, treat as expired
  return Date.now() >= expMs;
}

export function clearAuth() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");

  try {
    document.cookie = `authToken=; path=/; max-age=0`;
    document.cookie = `user=; path=/; max-age=0`;
    document.cookie = `token=; path=/; max-age=0`;
    document.cookie = `adminToken=; path=/; max-age=0`;
  } catch {}
}

export function logout(router: { replace: (path: string) => void }) {
  clearAuth();
  window.dispatchEvent(new Event("userAuthChanged"));
  router.replace("/login");
}
