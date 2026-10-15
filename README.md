# CareTrack – Quarantine & Treatment Centre

Web app for a 74-bed virus quarantine centre: daily temperature tracking, doctor discharge review, admin dashboard, and an indoor hospital map with search and step-by-step directions.

## Features

- **Login with roles** – Nurse, Doctor, Admin (plus Visitor = map only). The visible screens and actions change with the role.
- **Nurse:** daily rounds, record temperature with validation (30–45 °C, implausible/large-jump warnings), fever flag.
- **Doctor:** patients grouped as _Ready for discharge review / Still under treatment / Not measured yet_; discharge approval unlocks only after 3 full fever-free days.
- **Admin:** beds used (x/74), mortality vs 15 % target, success vs 85 % benchmark, discharge queue, admit patient, record outcome.
- **Hospital map:** 4 floors, 36 rooms, 74 patient beds; floor switching; clickable rooms; search by room, department, doctor or nurse; type filters; selected-room highlight with floor; step-by-step directions via corridors, lifts and stairs; **accessible route** (lifts only); admin can add, edit and delete rooms.

## Demo logins

| Role                  | Email               | Password  |
| --------------------- | ------------------- | --------- |
| Nurse                 | nurse@caretrack.in  | nurse123  |
| Doctor                | doctor@caretrack.in | doctor123 |
| Admin (Amruta Gavade) | amruta@caretrack.in | admin123  |

> Demo only: login and data live in the browser. Production plan: React/Next.js + Node/FastAPI + PostgreSQL (Supabase) with server-side JWT auth and role checks.

## Run locally

Open `index.html` in a browser (no build step).

## Deploy (Vercel, free)

1. Push this folder to GitHub. 2. vercel.com → _Add New → Project_ → import the repo. 3. Framework preset **Other**, no build command → **Deploy**. Every `git push` redeploys automatically.

## Patient vitals & history

Nurses record temperature, SpO2, pulse, blood pressure, respiratory rate and a note. Every patient has a **History & charts** page (for Nurse, Doctor and Admin) with trend charts (fever and low-SpO2 threshold lines) and a table of all previous readings.

## Quick free hosting without a new account (GitHub Pages)

Repo → **Settings → Pages** → Source: _Deploy from a branch_ → branch `main`, folder `/ (root)` → Save. Live in about a minute at `https://<username>.github.io/CareTrack-Quarantine-Centre/`.

## Project structure

```
index.html        page shell
css/style.css     styles (light + dark mode)
js/data.js        config, helpers, hospital rooms data
js/patients.js    vitals entry, discharge rules, nurse/doctor/admin views, patient charts
js/map.js         floor map, search, directions, admin room editor
js/app.js         login, role-based tabs, start-up
```
