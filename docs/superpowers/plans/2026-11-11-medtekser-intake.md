# MedTekser Intake Readiness Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Keep the current GitHub Pages URL while ensuring real requests are only reported as received after the API stores them, and make the app safe to configure for a production API host.

**Architecture:** The static frontend gets one configurable API base URL. Browser-local preview behavior remains available only in local development; the public GitHub Pages build fails closed and offers a user-initiated WhatsApp handoff when no API is configured. The existing Python/SQLite API remains the backend, with exact-origin CORS, request throttling, production startup checks, no automatic demo seeding, and an HTTPS privacy-notice gate before intake.

**Tech Stack:** Python 3 standard library, SQLite, static HTML/CSS/JavaScript, GitHub Pages workflow.

**Spec:** `docs/superpowers/specs/2026-11-11-medtekser-intake-design.md`

## Global Constraints

- Preserve `https://dansho09.github.io/medtekser/`.
- Do not add a government or medical registry integration.
- Do not collect employee IINs or medical information in a new flow.
- Do not publish, change domains, add secrets, or enable Telegram notifications.
- Do not present unverified clinic, license, tariff, timing, integration, or legal claims as verified facts.
- Keep the original RU/KK localization and existing no-dependency setup.
- Persist no client IP address; use it only for in-memory request throttling.

## Review Focus

- Missing or unreachable API: keep the form values, show no success state, and offer WhatsApp contact.
- API `200` or malformed body on request creation: do not treat it as the specified `201` acceptance.
- Unapproved browser origin: do not emit permissive CORS headers.
- Production configuration with a missing/default/short admin password: stop startup before serving.
- Production database initialization: do not add demo clinics, requests, employees, or credentials.

## Files And Responsibilities

- `static/api-config.js` (new): single public API base URL setting, blank until the API host is chosen.
- `static/common.js`: URL resolution, development-only local API, network errors, and downloads.
- `static/index.html`: safe request handoff, non-live registry notice, and removal of unsupported demo claims/data.
- `static/cabinet.html`, `static/admin.html`: remove public demo credentials and one-click demo logins; show useful unavailable states.
- `server.py`: production environment validation, CORS/preflight, memory-only request rate limit, and privacy-notice checks.
- `Dockerfile`, `.env.example`, `README.md`: production environment defaults and exact deployment configuration instructions.

## Tasks

### Task 1: Configure API access and fail-safe request handling

**Files:** `static/api-config.js`, `static/common.js`, `static/index.html`, `static/cabinet.html`, `static/admin.html`

- [x] Add `window.MEDTEKSER_API_BASE_URL` in `static/api-config.js`; keep it empty by default and load it before `common.js` on every page.
- [x] Resolve API calls and downloads against that base URL when configured.
- [x] Allow the local API only on `localhost`, loopback, or explicit local-file preview; never switch to local storage after a public network/CORS/404 error.
- [x] Require HTTP `201` plus a request ID before showing the request success screen.
- [x] Keep all entered fields when the API is unavailable; show a clear API-unavailable state and a WhatsApp link that the visitor must click to continue.
- [x] Show cabinet/admin API-unavailable states when the API base URL is blank; preserve normal error states when it is configured.

### Task 2: Remove public demo access and unsupported registry claims

**Files:** `static/index.html`, `static/cabinet.html`, `static/admin.html`, `static/common.js`

- [x] Remove the public sample IIN input, sample identifiers, local registry result rendering, fake signature/hash, and automatic employment eligibility verdicts; replace them with a clear statement that registry verification is not connected.
- [x] Remove the public HR `DEMO12` link and admin `admin123` one-click login; do not expose credentials in page copy or scripts.
- [x] Do not generate sample request, employee, or clinic records in any environment; no real-looking IINs are requested or displayed on public pages.
- [x] Remove or clearly label unsupported clinic/license details, ratings, availability slots, exact prices, fine amounts, market statistics, and government/medical integration claims. Retain only general service information and the request/contact path.

### Task 3: Harden the Python API for separate-origin hosting

**Files:** `server.py`

- [x] Add `APP_ENV`, `ALLOWED_ORIGINS`, and request-limit settings; default the allowed public origin to `https://dansho09.github.io` and allow additional origins only through explicit configuration.
- [x] Add exact-origin CORS response headers and `OPTIONS` preflight support for `GET, POST, PUT, DELETE` and `Authorization, Content-Type`.
- [x] Add a thread-safe in-memory sliding-window limit of 5 `POST /api/requests` attempts per source IP per 10 minutes; return `429` and `Retry-After` without writing the IP to SQLite.
- [x] Require a non-default admin password of at least 16 characters when `APP_ENV=production`; fail startup if missing or invalid.
- [x] Do not seed demo clinics, requests, employees, or credentials into the database.

### Task 4: Document local and production setup

**Files:** `Dockerfile`, `.env.example`, `README.md`

- [x] Set Docker's default `APP_ENV=production`; require `ADMIN_PASSWORD` at runtime and document the persistent `/data` volume.
- [x] Document `MEDTEKSER_API_BASE_URL` editing in `static/api-config.js`, matching `ALLOWED_ORIGINS`, HTTPS, database persistence, and the fallback behavior when the API URL is blank.
- [x] Mark `admin123`, if retained for local development, as local-only; remove the promise of a public demo login.
- [x] State that an API host, privacy notice, and verified business facts are required before live intake/marketing claims can be activated.


### Task 5: Harden account access and browser protections

**Files:** `server.py`, `.env.example`, `README.md`, `static/common.js`, `static/cabinet.html`, `static/admin.html`, `static/index.html`, `static/style.css`

- [x] Generate 16-character cryptographically random access codes for new requests; continue accepting existing codes.
- [x] Rate-limit cabinet and admin login attempts to 10 per source IP per 15 minutes; keep IPs only in process memory and return `429` with `Retry-After`.
- [x] Remove the development server's default admin password. If no server password is configured, disable API admin login with a clear `503`; keep local browser preview explicitly local-only.
- [x] Limit admin sessions to 12 hours and retain 14-day company sessions.
- [x] Add anti-framing, restrictive permissions and production HSTS response headers; announce form/login errors to assistive technology.
- [x] Clearly identify browser-only preview, its local-only sign-in and storage, and avoid claiming local submissions reached the operator; remove illustrative progress values that look like real metrics.
- [x] Neutralize spreadsheet formulas in both API and local-preview CSV exports.
- [x] Run syntax/whitespace checks and review the changed auth paths. Do not add or run automated tests unless asked.

## Completion Checks

- [x] Re-read the diff against the approved spec and confirm no unverified clinic, price, licensing, legal, or registry claims remain presented as fact.
- [x] Run Python and JavaScript syntax checks and inspect the GitHub Pages publish path; do not submit real information to the public form.
- [x] Confirm the working tree changes are confined to the MedTekser project and this plan/spec documentation.
