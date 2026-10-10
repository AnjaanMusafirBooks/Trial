(function () {
  "use strict";
  const SESSION_KEY = "nm_admin_session_v2";
  const apiBase = String(window.NM_NEW_VERSION_CONFIG?.API_BASE || "").trim().replace(/\/+$/, "");
  const status = document.getElementById("global-status");
  const logoutButton = document.getElementById("logout-button");
  let session = null;

  function readSession() {
    try {
      const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (!value || typeof value.token !== "string" || !value.expiresAt || Date.parse(value.expiresAt) <= Date.now()) return null;
      return value;
    } catch { return null; }
  }
  function clearSession() { sessionStorage.removeItem(SESSION_KEY); }
  function showStatus(message, kind) {
    status.textContent = message;
    status.className = "status-box" + (kind ? " " + kind : "");
  }
  function redirectLogin() { clearSession(); window.location.replace("team-login.html"); }
  async function request(path, options = {}) {
    const response = await fetch(apiBase + path, {
      cache: "no-store",
      ...options,
      headers: { ...(options.headers || {}), Authorization: "Bearer " + session.token }
    });
    let body = {};
    try { body = await response.json(); } catch { throw new Error("Server response पढ़ा नहीं जा सका।"); }
    if (response.status === 401) { redirectLogin(); throw new Error("Session expired. फिर से login करें।"); }
    if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Request पूरा नहीं हुआ।");
    return body;
  }
  function setProfile(user, expiry) {
    document.getElementById("display-name").textContent = user.display_name || user.email || "Team member";
    document.getElementById("profile-name").textContent = user.display_name || "—";
    document.getElementById("profile-email").textContent = user.email || "—";
    document.getElementById("profile-role").textContent = user.role || "—";
    document.getElementById("profile-expiry").textContent = expiry ? new Date(expiry).toLocaleString() : "—";
    document.getElementById("user-badge").textContent = (user.display_name || user.email || "Team") + " · " + (user.role || "Unknown role");
    document.getElementById("session-state").textContent = "Session verified";
  }
  async function start() {
    session = readSession();
    if (!session) { redirectLogin(); return; }
    if (!apiBase || !/^https:\/\//i.test(apiBase)) {
      showStatus("Candidate API URL configure नहीं है। Dashboard data या session को verified नहीं माना जा सकता।", "error");
      document.getElementById("session-state").textContent = "API not configured";
      logoutButton.disabled = true;
      return;
    }
    try {
      const data = await request("/api/v2/admin/me");
      if (!data.user) throw new Error("Server ने account details नहीं लौटाईं।");
      setProfile(data.user, data.expires_at || session.expiresAt);
      showStatus("Login session server से verify हो गई। Business metrics तब तक unavailable रहेंगी जब तक real reports APIs implement न हों।", "ok");
      session.user = data.user;
      session.expiresAt = data.expires_at || session.expiresAt;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      if (error instanceof Error && !/redirect/i.test(error.message)) showStatus(error.message, "error");
    }
  }
  logoutButton.addEventListener("click", async function () {
    if (!session || !apiBase) { clearSession(); redirectLogin(); return; }
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out…";
    try {
      await request("/api/v2/admin/logout", { method: "POST" });
      showStatus("Logout सफल रहा।", "ok");
    } catch (error) {
      showStatus("Server logout की पुष्टि नहीं हुई। Local session हटाया जा रहा है।", "error");
    } finally {
      clearSession();
      window.location.replace("team-login.html");
    }
  });
  start();
})();
