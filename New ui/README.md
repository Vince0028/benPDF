<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1I8n7zc0TPmDiY-dHFqkeiRcS-vdEM3I4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the dev server:
   `npm run dev`

## Build & Use with Flask Backend

The Flask app (`app.py` in the project root) now auto-serves the built React UI if it finds `New ui/dist/index.html`.

Steps (Windows PowerShell):

```powershell
cd "New ui"
npm install   # first time only
npm run build # generates dist/
cd ..
python app.py
```

After building, visiting `http://localhost:5000/` will show the new UI. All API calls still use the same origin (e.g. `/api/convert-image`).

If you start Flask before building, it will fall back to the old Jinja `templates/index.html` until you run the build.

To rebuild after changes:

```powershell
cd "New ui"; npm run build; cd ..
```

The app uses `HashRouter`, so only the root path (`/`) needs to be served by Flask.

## Hot Reload Dev Mode (Recommended During UI Changes)

Use Vite's dev server so you only need to save and refresh (no `npm run build` each change).

1. Start Flask backend (port 5000):
```powershell
py app.py
```
2. In a second terminal start Vite (port 3000):
```powershell
cd "New ui"
npm run dev
```
3. Open `http://localhost:3000` in the browser.

The `vite.config.ts` proxy sends any `/api/*` requests (and `/healthz`) to `http://localhost:5000` automatically. Your existing `fetch('/api/...')` calls work in dev without CORS setup.

Only run `npm run build` when you want to serve the static production build from Flask.
