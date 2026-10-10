(function () {
  "use strict";
  const form = document.getElementById("login-form");
  const button = document.getElementById("login-button");
  const status = document.getElementById("form-status");
  const configNotice = document.getElementById("config-notice");
  const apiBase = String(window.NM_NEW_VERSION_CONFIG?.API_BASE || "").trim().replace(/\/+$/, "");
  const SESSION_KEY = "nm_admin_session_v2";
  const roles = new Set(["FOUNDER","ADMINISTRATOR","OPERATIONS_MANAGER","PRODUCT_MANAGER","MARKETING_MANAGER","CUSTOMER_SUPPORT","CONTENT_EDITOR","ANALYST","TECHNICAL_SUPPORT"]);

  if (apiBase && /^https:\/\//i.test(apiBase)) {
    button.disabled = false;
    configNotice.textContent = "Candidate API configured. केवल staging Worker का URL इस्तेमाल करें।";
    configNotice.className = "notice notice-ok";
  } else {
    button.disabled = true;
    configNotice.textContent = "Candidate API configure नहीं है। new-version-config.js में अलग staging Worker का HTTPS URL सेट करें। Production Worker URL यहाँ न डालें।";
  }

  function setStatus(message, kind) {
    status.textContent = message || "";
    status.className = "form-status" + (kind ? " " + kind : "");
  }
  async function api(path, options) {
    const response = await fetch(apiBase + path, { cache: "no-store", ...options });
    let data = {};
    try { data = await response.json(); } catch { throw new Error("Server का response समझ नहीं आया। बाद में फिर कोशिश करें।"); }
    if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Login पूरा नहीं हो सका।");
    return data;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!apiBase || !/^https:\/\//i.test(apiBase)) return;
    if (button.disabled) return;
    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!roles.has(role) || !email || !password) { setStatus("Role, email और password भरें।"); return; }

    button.disabled = true;
    button.textContent = "Verifying…";
    setStatus("Credentials verify हो रहे हैं…");
    try {
      const data = await api("/api/v2/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!data.session_token || !data.user || !roles.has(data.user.role)) throw new Error("Server ने valid session नहीं लौटाया।");
      if (data.user.role !== role) {
        try {
          await api("/api/v2/admin/logout", { method: "POST", headers: { Authorization: "Bearer " + data.session_token } });
        } catch (_) { /* Do not display or log the token. */ }
        throw new Error("यह account चुने गए role से match नहीं करता। सही role चुनकर दोबारा कोशिश करें। Session बंद करने की request भेज दी गई है।");
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: data.session_token, expiresAt: data.expires_at, user: data.user }));
      document.getElementById("password").value = "";
      window.location.assign("admin-dashboard.html");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login पूरा नहीं हो सका।");
    } finally {
      button.disabled = !apiBase || !/^https:\/\//i.test(apiBase);
      button.textContent = "Secure Login";
    }
  });
})();
