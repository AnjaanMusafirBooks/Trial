# New Version — Batch 03: Team Login UI + Dashboard shell

## Files in this batch (10 total)

### Existing files to replace ONLY in the isolated frontend candidate branch
- `index.html` — adds a visible Team Login header link and a Team Login item inside the responsive navigation menu.
- `style.css` — styles the header Team Login link.

### New frontend files
- `new-version-config.js` — public candidate API URL config. `API_BASE` intentionally blank until the isolated staging Worker URL is assigned.
- `team-login.html`
- `team-login.css`
- `team-login.js`
- `admin-dashboard.html`
- `admin-dashboard.css`
- `admin-dashboard.js`

## Required upload paths
Upload the two replacement files to the same paths as the existing frontend files. Upload the seven new files to the frontend repository root, beside `index.html`.

## Security/functional notes
- Login calls `POST /api/v2/admin/login` on the configured candidate API.
- The selected role is checked against the role returned by the server; the role selector does not grant privileges.
- Session token is kept in `sessionStorage`, not URL/localStorage, and is never intentionally logged. Static frontend token storage remains exposed to same-origin script execution; deploy only after reviewing CSP/XSS hardening.
- Dashboard calls `GET /api/v2/admin/me` and `POST /api/v2/admin/logout`.
- Dashboard business metric cards explicitly say unavailable; no demo data is presented because the real reports APIs have not been implemented yet.
- Do not set `API_BASE` to the production Worker. Configure it only after a separate staging Worker URL and CORS allowlist are ready.
- This batch does not implement staff management UI or actual business modules.

## Not done
- No production deployment.
- No live Worker/D1 authentication test.
- No real login can work until `API_BASE` points to a deployed isolated staging Worker with the required migration applied and CORS correctly configured.
