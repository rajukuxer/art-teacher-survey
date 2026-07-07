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

Local Express submissions are saved to:

```text
data/art-teacher-feedback.json
```

That file is ignored by Git so private responses are not pushed to GitHub.

On Netlify, submissions are captured through Netlify Forms under the form name:

```text
artTeacherFeedback
```

## API

- `GET /api/health`
- `POST /api/feedback`

Required feedback fields:

- `audience`
- `classSetup`
- `worksWell`
- `wish`
- `email`

## Netlify deployment

Deploy this as a static Netlify site.

Recommended Netlify settings:

- Build command: leave blank
- Publish directory: `public`

The repo includes `netlify.toml`, so Netlify should detect `public` automatically and route deep links back to `index.html`.

For a permanent Node/Express deployment on Render or Railway, use `npm ci` as the build command and `npm start` as the start command.
