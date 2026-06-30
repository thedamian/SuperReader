# SuperREader4

Low-vision form-filling assistant. Point the phone camera at a paper form and it tells you, in big high-contrast text, what to write.

## Stack
- **Backend**: Node.js + Express + TypeScript, calls OpenAI GPT-4o vision.
- **Frontend**: React + Vite + TypeScript, installable PWA, mobile-first, low-vision friendly.

## Layout
- `server/` — Express API exposing `POST /api/analyze`.
- `client/` — Vite + React PWA with two tabs (Info / Read).

## Getting started

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` at the repo root and fill in your `OPENAI_API_KEY`.
   ```
   cp .env.example .env
   ```
3. Run both dev servers:
   ```
   npm run dev
   ```
   - Server: http://localhost:8787
   - Client: http://localhost:5173 (proxies `/api` to the server)

## Build
```
npm run build
npm start
```
Then open http://localhost:8787 (server serves the built PWA).

## How it works
- **Info tab**: fill in your personal information (name, DOB, SSN, full address, phone, email, employer, occupation, emergency contact). Saved to `localStorage`.
- **Read tab**: full-screen camera. Tap **Read** — for the next 5 minutes it adaptively captures frames (skipping while a request is in-flight) and sends them to the backend. The backend asks GPT-4o to find a blank field on the form, match it to one of your stored fields, and return:
  - the value you should write (big, thick black text on white at the top),
  - a bounding box (yellow transparent overlay with a pencil icon) showing where to write it.

## Environment variables
| Name | Required | Description |
|------|----------|-------------|
| `OPENAI_API_KEY` | yes | OpenAI API key with GPT-4o access |
| `OPENAI_MODEL` | no | Default `gpt-4o` |
| `PORT` | no | Default `8787` |

## Notes for low-vision users
- Large tap targets, big text, high contrast (black on white).
- One field shown at a time at the top of the screen.
- Full-screen camera with no clutter; only a bottom nav and a big Read button.
