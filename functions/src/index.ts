import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "15mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectedField {
  fieldKey: string;
  label: string;
  value: string;
  boundingBox: BoundingBox;
}

interface AnalyzeResponse {
  detectedFields: DetectedField[];
}

interface PersonalData {
  firstName?: string;
  lastName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  age?: string;
  dateOfBirth?: string;
  email?: string;
  gender?: string;
  [key: string]: string | undefined;
}

const FIELD_LABELS: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  streetAddress: "Street Address",
  city: "City",
  state: "State",
  zipCode: "ZIP / Postal Code",
  phoneNumber: "Phone Number",
  emergencyContactName: "Emergency Contact Name",
  emergencyContactPhone: "Emergency Contact Phone",
  age: "Age",
  dateOfBirth: "Date of Birth",
  email: "Email Address",
  gender: "Gender",
};

// Handle both /analyze-frame and /api/analyze-frame for dev/prod compatibility
async function analyzeFrameHandler(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const { image, personalData } = req.body as {
      image: string;
      personalData: PersonalData;
    };

    if (!image) {
      res.status(400).json({ error: "Image is required" });
      return;
    }

    // Build a summary of saved personal data for Claude
    const savedFields = Object.entries(personalData || {})
      .filter(([, v]) => v && v.trim() !== "")
      .map(([key, value]) => `- ${FIELD_LABELS[key] || key}: "${value}"`)
      .join("\n");

    if (!savedFields) {
      res.json({ detectedFields: [] });
      return;
    }

    // Strip data URL prefix if present and get mime type
    const mimeMatch = image.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = (mimeMatch ? mimeMatch[1] : "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/heic"
      | "image/heif";
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are helping someone with reading difficulties fill out a paper form. Analyze this image carefully.

The person has these personal details saved:
${savedFields}

Task: Look for any form field labels and blank lines/boxes in this image that match the saved personal data above.

For each matching form field found, identify:
1. Which personal data field it corresponds to
2. The approximate bounding box of the BLANK WRITING AREA (where the person needs to write), NOT the label text

Return ONLY a valid JSON object with this exact structure (no extra text, no markdown):
{
  "detectedFields": [
    {
      "fieldKey": "firstName",
      "label": "First Name",
      "value": "John",
      "boundingBox": {
        "x": 0.05,
        "y": 0.30,
        "width": 0.45,
        "height": 0.06
      }
    }
  ]
}

Rules:
- boundingBox coordinates are normalized 0.0 to 1.0 (x=0 left, y=0 top, x=1 right, y=1 bottom)
- fieldKey must be one of: firstName, lastName, streetAddress, city, state, zipCode, phoneNumber, emergencyContactName, emergencyContactPhone, age, dateOfBirth, email, gender
- Only include fields that are clearly visible in the image AND have a matching saved value
- If no form is visible or no matching fields are found, return { "detectedFields": [] }
- The boundingBox should cover the blank line or input box, not the field label
- Return ONLY the JSON, no other text`;

    const geminiResult = await model.generateContent([
      { inlineData: { mimeType, data: base64Image } },
      { text: prompt },
    ]);

    const text = geminiResult.response.text();

    let parsed: AnalyzeResponse;
    try {
      // Extract JSON from the response (handle any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
      parsed = JSON.parse(jsonStr) as AnalyzeResponse;
      if (!parsed.detectedFields) {
        parsed = { detectedFields: [] };
      }
    } catch {
      parsed = { detectedFields: [] };
    }

    res.json(parsed);
  } catch (error) {
    console.error("Error analyzing frame:", error);
    res.status(500).json({ error: "Failed to analyze frame" });
  }
}

app.post("/api/analyze-frame", analyzeFrameHandler);
app.post("/analyze-frame", analyzeFrameHandler);

// Health check
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok" });
});

export const api = functions.https.onRequest(app);
