# Kusu – Registration form saved to MongoDB Atlas

A static HTML form (`index.html`) that posts to a Vercel serverless function (`api/submit.js`), which stores each submission in MongoDB Atlas.

## Environment variables (Vercel → Project → Settings → Environment Variables)
- `MONGODB_URI` – Atlas connection string, e.g. `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/`
- `MONGODB_DB` – optional, defaults to `kusu`

Submissions are saved in the `submissions` collection.

## Notes
- Atlas Network Access must allow Vercel (`0.0.0.0/0`).
- `Code.gs` is the older Google Sheets option and is not used by the form any more.
