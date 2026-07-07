# Art Teacher Feedback Form

Mobile-friendly feedback form for independent art teachers. It collects class-management challenges, admin pain points, time-saving estimates, and a required email address.

## Features

- Modern mobile-first UI with a 3D-style banner
- Six-step feedback form with progress state
- Required email collection with client and server validation
- Local JSON response storage for quick testing
- Express static hosting and API endpoint

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3333`.

## Feedback storage

Submissions are saved to:

```text
data/art-teacher-feedback.json
```

That file is ignored by Git so private responses are not pushed to GitHub.

## API

- `GET /api/health`
- `POST /api/feedback`

Required feedback fields:

- `audience`
- `classSetup`
- `worksWell`
- `wish`
- `email`

## Hosting note

Deploy this as a Node/Express web service, not as a static site.

Recommended Render settings:

- Build command: `npm ci`
- Start command: `npm start`
- Environment: Node
- Health check path: `/api/health`

The repo includes `render.yaml` and `Procfile` so Render/Railway-style hosts can detect the app correctly.

For a permanent production version, connect `/api/feedback` to a database, Google Sheet, Airtable, or email service. Local JSON storage is useful for previews, but hosted platforms often reset local files between deploys.
