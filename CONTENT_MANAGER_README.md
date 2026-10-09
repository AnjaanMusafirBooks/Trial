# Site Content Manager

Open `content-manager.html` after the Worker deployment and D1 migration. The page uses the existing `ADMIN_KEY` secret; do not share it. `Preview Draft` previews the current editor text without publishing. `Save Draft` is not public. `Publish Changes` publishes content through Cloudflare D1 and `/api/site-content`.

## Publish order
1. Back up the existing D1 database.
2. Run `db/migrations/001_site_content.sql` from the backend ZIP once on the existing D1 database.
3. Deploy the updated Worker while preserving current secrets and bindings.
4. Upload this frontend ZIP's files to the existing GitHub Pages repository using the same paths.
5. Open `content-manager.html`, log in with the existing `ADMIN_KEY`, then test Preview, Draft, Publish, Disable and Enable.

The policy HTML pages keep their original static fallback if the API is unavailable. See the backend ZIP's `SITE_CONTENT_SETUP.md` for route and test details.
