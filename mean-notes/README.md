# MEAN Notes

A notes app built on the MEAN stack with sign-up and login.

- **MongoDB** (Atlas) stores users and notes
- **Express + Node** provide the REST API (`server/`, exposed on Vercel through `api/index.js`)
- **Angular** is the front end (`client/`)
- Passwords are hashed with bcrypt, sessions use JWT (7 days)

## Environment variables
| Name | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string (`mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/`) |
| `JWT_SECRET` | Long random string used to sign login tokens (16+ characters) |
| `MONGODB_DB` | Optional database name, defaults to `meannotes` |

## Run locally
```bash
cp .env.example .env        # fill in MONGODB_URI and JWT_SECRET
npm install
npm run client:install
npm run dev                 # API on http://localhost:3000
cd client && npm start      # Angular on http://localhost:4200 (proxies /api to the API)
```

## Deploy on Vercel
Import the repo (set the root directory to `mean-notes` if it lives in a subfolder), add the environment variables above, and deploy. `vercel.json` already contains the build settings.
In Atlas, Network Access must allow Vercel (`0.0.0.0/0`).

## API
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/notes?q=`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id` (Bearer token required)
