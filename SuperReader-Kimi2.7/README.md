# SuperReader

SuperReader is a low-vision-first phone web app for saving personal form information locally, then using the camera plus OpenAI vision to help identify which saved value belongs in visible paper form fields.

## Run locally

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create `backend/.env`:

   ```env
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-5.5
   PORT=5030
   ```

3. Start both apps:

   ```powershell
   npm run dev
   ```

Frontend: http://localhost:5029

Backend: http://localhost:5030

## Notes

- Profile data is stored in browser `localStorage` as requested. That means sensitive fields such as SSN stay on the device/browser profile but are not encrypted.
- The camera page performs local OCR first. When text is detected, it sends the frame, detected OCR text, and saved profile values to the backend for OpenAI vision guidance.
- Camera access usually requires `localhost` or HTTPS on mobile browsers.
