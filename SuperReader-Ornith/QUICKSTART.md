# SuperReader Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd C:/Users/photo/Desktop/Code/SuperReader
npm run install:all
```

This installs dependencies for both backend and frontend.

### Step 2: Start the Application

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd C:/Users/photo/Desktop/Code/SuperReader/backend
npm run dev
```
You should see: `🚀 Backend server running on http://localhost:5028`

**Terminal 2 - Frontend:**
```bash
cd C:/Users/photo/Desktop/Code/SuperReader/frontend
npm run dev
```
You should see: `VITE v5.4.x ready in xxx ms`

### Step 3: Open the App

Navigate to: **http://localhost:5029** in your browser (preferably Chrome or Edge on a phone).

## 📱 Using the App

### Page 1: Information Form
1. Fill in your personal details (name, address, contact info)
2. Add government ID information (SSN, driver's license, etc.)
3. Click **"Save & Continue to Reader"** button
4. Your data is saved automatically to localStorage

### Page 2: Camera Reader
1. Click the **"Read"** tab at the bottom
2. Press the big **"📷 Read"** button
3. Allow camera permissions when prompted
4. Point your phone at any form or document
5. Wait for yellow boxes to appear showing where fields are detected
6. Follow the large text instructions at the top
7. The reading mode runs for **5 minutes** automatically

## 🔧 Troubleshooting

### Camera not working?
- Make sure you're using HTTPS or localhost (required by browsers)
- Check browser permissions for camera access
- Try refreshing the page and granting permission again

### Backend won't start?
- Ensure port 5028 is available
- Check if Node.js is installed: `node --version`
- Run `npm install` in the backend folder

### Frontend won't build?
- Ensure port 5029 is available
- Clear cache: `cd frontend && npm run clean && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

## 🎯 Testing with Mock Data

The app includes a mock LLM implementation that simulates text detection. To test:

1. Fill in some fields on the Info page (even just first name and last name)
2. Navigate to Camera page
3. Click "Read"
4. You should see yellow boxes appear after a few seconds
5. The timer should count down from 5:00

## 🌐 Production Deployment

For production, you'll want to:

1. **Connect real LLM API** (OpenAI, Azure AI Vision)
   - Edit `backend/.env` with your API key
   - Update the mock implementation in `llm.routes.ts`

2. **Build for production**
   ```bash
   cd frontend
   npm run build
   ```

3. **Serve the built files** (use any static file server or deploy to Vercel, Netlify, etc.)

4. **Deploy backend** to a cloud service (Azure App Service, AWS, Heroku, etc.)

## 📞 Need Help?

- Check the full README.md for detailed documentation
- Review the code comments in each file
- Ensure both services are running on the correct ports
- Check browser console for errors

---

**Happy reading! 📖✨**
