# SuperReader

A mobile-friendly web app that helps people with reading difficulties or memory issues fill out paper forms. Point your phone camera at any form and the app will highlight each field and display — in large, easy-to-read text — exactly what to write there.

---

## How It Works

1. **Save your info** — Enter your personal details once on the My Info page. Everything is stored locally on your device; nothing is uploaded to a server.
2. **Point the camera** — Switch to the Camera tab and hold your phone over a paper form.
3. **Get guided** — Every 2 seconds the app sends the camera frame to the backend, which uses **Google Gemini Vision** to identify form fields. Matching fields are highlighted with a large red rectangle and the correct answer is shown in giant text at the bottom of the screen.

---

## Project Structure

```
SuperReader/
├── firebase.json          # Firebase Hosting + Functions config
├── .firebaserc            # Firebase project alias
├── functions/             # Firebase Functions backend (Node 18, TypeScript)
│   ├── src/
│   │   └── index.ts       # Express server — POST /api/analyze-frame (Gemini Vision)
│   ├── package.json
│   └── .env.example       # Copy to .env and add your GEMINI_API_KEY
└── frontend/              # React + TypeScript frontend (Vite)
    ├── src/
    │   ├── App.tsx         # Root layout with bottom tab bar
    │   ├── types.ts        # Shared types and constants
    │   └── pages/
    │       ├── ProfilePage.tsx   # Personal info form (saves to localStorage)
    │       └── CameraPage.tsx    # Camera + canvas overlay + Gemini analysis
    ├── index.html
    └── vite.config.ts     # Dev proxy for local Firebase emulator
```

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Firebase CLI** — `npm install -g firebase-tools`
- **Google Gemini API key** — get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- A Firebase project — create one at [console.firebase.google.com](https://console.firebase.google.com)

---

## Local Development

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd SuperReader

# Install backend dependencies
cd functions && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Set your Gemini API key

```bash
cp functions/.env.example functions/.env
# Open functions/.env and set your key:
# GEMINI_API_KEY=your_key_here
```

### 3. Set your Firebase project

```bash
firebase login
firebase use --add   # Select or create your Firebase project
```

### 4. Start the Firebase Functions emulator

```bash
cd functions && npm run build && cd ..
firebase emulators:start --only functions
```

The API will be available at `http://localhost:5001/<project-id>/us-central1/api`.

### 5. Start the frontend dev server

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> The Vite dev server proxies `/api` requests to the local Firebase Functions emulator automatically.

---

## Deployment

### 1. Build both the frontend and backend

```bash
cd functions && npm run build && cd ..
cd frontend && npm run build && cd ..
```

### 2. Set the Gemini API key in Firebase

```bash
firebase functions:config:set gemini.key="your_key_here"
```

Or use Firebase Secret Manager (recommended for production):

```bash
firebase functions:secrets:set GEMINI_API_KEY
# Paste your key when prompted
```

### 3. Deploy

```bash
firebase deploy
```

This deploys:
- **Firebase Functions** — the Express backend at `/api`
- **Firebase Hosting** — the React frontend, with `/api/**` rewriting to the function

Your app will be live at `https://<project-id>.web.app`.

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `GEMINI_API_KEY` | `functions/.env` (local) or Firebase secrets (prod) | Google Gemini API key for vision analysis |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Firebase Functions (Node 18), Express, TypeScript |
| Hosting | Firebase Hosting |
| AI Vision | Google Gemini 2.0 Flash (`gemini-2.0-flash`) |
| Storage | Browser `localStorage` (no database) |

---

## Features

- **Page 1 — My Info**: Form fields for first/last name, address, city, state, ZIP, phone, emergency contact (name + phone), age, date of birth, email, and gender. Data is persisted to `localStorage`.
- **Page 2 — Camera**: Full-screen camera view with a canvas overlay that draws large red rectangles around detected form fields every 2 seconds. The bottom panel shows the field name and the correct answer in very large text.
- **Bottom Tab Bar**: Always-visible navigation between the two pages.
- **Accessible design**: Large fonts, high-contrast colors, and simple layout designed for users with reading or memory difficulties.
