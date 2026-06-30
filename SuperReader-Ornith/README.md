# SuperReader - Accessibility-Focused Reading Assistant

A comprehensive web application designed for people with low vision to help fill out government forms and documents using their phone's camera.

## 🎯 Overview

SuperReader is a mobile-first web app that:
- **Collects user information** through an accessible form (name, address, contact info, government ID details)
- **Uses the camera** to scan documents in real-time
- **Detects text fields** using AI/LLM analysis
- **Highlights where to write** with yellow transparent overlays and large text displays
- **Works continuously for 5 minutes** per reading session

## ✨ Features

### Accessibility (Low Vision Optimized)
- ✅ Large font sizes (minimum 18px, up to 40px+)
- ✅ High contrast colors (black text on white background)
- ✅ Large touch targets (64px minimum)
- ✅ Clear focus indicators with blue outlines
- ✅ Yellow transparent overlays for detected fields
- ✅ Thick black writing display for recognized text
- ✅ ARIA labels and live regions for screen readers
- ✅ Reduced motion support
- ✅ High contrast mode support

### Two Main Pages

#### Page 1: Information Form
Comprehensive form to collect user data including:
- **Personal Information**: First name, last name, date of birth, place of birth, gender, marital status, nationality
- **Address Fields**: Street address (split into line 1 & 2), city, state, ZIP code, country
- **Contact Information**: Phone number, email
- **Government ID**: Social Security Number, driver's license number, issuing state, expiration date, passport number
- **Employment**: Occupation, employer name, employer address
- **Emergency Contact**: Name, phone, relationship

All data is saved to `localStorage` for persistence.

#### Page 2: Camera Reader
- 📷 Full-screen camera feed
- ⏱️ 5-minute reading timer
- 🔍 Continuous text detection (every second)
- 💛 Yellow transparent boxes showing where fields are detected
- ✏️ Large pencil icon and field name display
- 📝 Thick black text showing what the system sees
- ⬆️⬇️ Field navigation buttons

### Navigation
- Bottom tab bar with "Info" and "Read" tabs
- Active tab highlighting
- Easy thumb-friendly placement

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** (TypeScript)
- **CORS** for cross-origin requests
- **Mock LLM integration** (easily replaceable with OpenAI, Azure AI Vision, etc.)

### Frontend
- **React 18** (TypeScript)
- **Vite** (latest build tool)
- **CSS3** (custom accessibility-focused styles)
- **Native Camera API** (no third-party libraries needed)

## 📦 Installation

```bash
# Navigate to the project directory
cd C:/Users/photo/Desktop/Code/SuperReader

# Install all dependencies (backend + frontend)
npm run install:all
```

Or manually:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## 🚀 Running the Application

### Development Mode

You can run both backend and frontend simultaneously:

**Option 1: Using npm scripts (recommended)**
```bash
# In one terminal - Start backend
cd backend
npm run dev

# In another terminal - Start frontend
cd frontend
npm run dev
```

**Option 2: Using the root package.json**
```bash
# Terminal 1
npm run dev:backend

# Terminal 2  
npm run dev:frontend
```

### Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Preview production build
npm run preview
```

## 🌐 URLs

- **Frontend**: http://localhost:5029
- **Backend API**: http://localhost:5028/api
- **Health Check**: http://localhost:5028/health

## 🔌 API Endpoints

### User Data Management (`/api/auth`)

#### POST `/api/auth/user` - Save user information
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "addressLine1": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "phone": "(555) 123-4567",
  ...
}
```

#### GET `/api/auth/user` - Retrieve user information
```json
{
  "success": true,
  "data": { ... },
  "userId": "default-user"
}
```

### LLM Analysis (`/api/llm`)

#### POST `/api/llm/analyze` - Analyze camera image for text fields
```json
{
  "imageData": "base64-encoded-image",
  "userData": { ... },
  "documentType": "government-form"
}
```

Returns:
```json
{
  "success": true,
  "detectedText": "FIRST NAME",
  "fields": [
    {
      "fieldId": "firstName",
      "fieldName": "First Name",
      "value": "John",
      "boundingBox": { "x": 100, "y": 200, "width": 150, "height": 40 }
    }
  ],
  "confidence": 0.85
}
```

#### POST `/api/llm/detect-text` - Simple text detection
Returns detected text without field mapping.

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)

```env
PORT=5028
NODE_ENV=development

# LLM API (optional - uses mock if not provided)
LLM_API_KEY=your-api-key-here
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o

CORS_ORIGIN=http://localhost:5029
```

### Frontend Environment Variables (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5028/api
```

## 🤖 LLM Integration Options

The app includes a mock LLM implementation for development. To connect to real AI services:

### Option 1: OpenAI GPT-4o
```env
LLM_API_KEY=sk-your-openai-key
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o
```

### Option 2: Azure AI Vision (Recommended for production)
Replace the mock implementation in `backend/src/routes/llm.routes.ts` with Azure Computer Vision API calls.

### Option 3: Google Cloud Vision
Similar integration pattern - replace the mock response with actual API calls.

## 📱 Browser Permissions

The app requires camera access. You'll need to:
1. Allow camera permissions when prompted
2. Use HTTPS or localhost (browser requirement for camera access)
3. Test on a mobile device for best experience

## ♿ Accessibility Features in Detail

### Visual Design
- **Minimum font size**: 18px (exceeds WCAG guidelines)
- **Color contrast**: All text meets AAA standards (7:1 ratio)
- **Touch targets**: Minimum 64x64 pixels (exceeds recommended 44x44)
- **Spacing**: Generous padding between interactive elements

### Interaction Design
- **Focus indicators**: 4px solid blue outline on all focusable elements
- **Button states**: Clear visual feedback for hover, active, disabled
- **Field highlighting**: Pulsing yellow animation draws attention to detected fields
- **Large buttons**: Full-width action buttons with clear labels

### Screen Reader Support
- **ARIA labels**: All interactive elements have descriptive labels
- **Live regions**: Dynamic content updates announced via `aria-live`
- **Semantic HTML**: Proper use of headings, landmarks, and form associations
- **Keyboard navigation**: All features accessible via keyboard

### Cognitive Accessibility
- **Simple language**: Clear, concise instructions
- **Consistent layout**: Predictable structure across screens
- **Error handling**: Helpful error messages with recovery suggestions
- **Progress indicators**: Timer shows remaining time in reading mode

## 🎨 Customization

### Change Colors
Edit CSS variables in `frontend/src/index.css`:
```css
:root {
  --primary-color: #0066cc;
  --text-color: #1a1a1a;
  --background-color: #ffffff;
  /* ... */
}
```

### Adjust Font Sizes
Modify the `--font-size-*` variables in the same file.

### Modify Field Detection
Update the mock implementation in `backend/src/routes/llm.routes.ts` or replace with real AI integration.

## 🔮 Future Enhancements

- [ ] Real LLM integration (OpenAI, Azure AI Vision)
- [ ] Document type detection (tax forms, applications, etc.)
- [ ] Multi-language support
- [ ] Voice guidance for field navigation
- [ ] Saved document templates
- [ ] Export filled forms as PDF
- [ ] Offline mode with service workers
- [ ] Cloud storage backup for user data
- [ ] Biometric authentication for sensitive fields (SSN, etc.)
- [ ] Haptic feedback on field detection

## 📄 License

MIT License - feel free to use and modify.

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests.

## 📞 Support

For issues or questions:
1. Check if camera permissions are granted
2. Verify both backend (port 3001) and frontend (port 5173) are running
3. Check browser console for errors
4. Ensure you're using HTTPS or localhost for camera access

---

**Built with ❤️ for accessibility and inclusion.**
