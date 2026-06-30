import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

export interface UserInfo {
  firstName: string;
  lastName: string;
  middleInitial?: string;
  dateOfBirth?: string;
  socialSecurityNumber?: string;
  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email?: string;
  other?: string;
}

export interface DetectedField {
  fieldName: keyof UserInfo | string;
  label: string;
  value: string;
  box: [number, number, number, number];
}

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  middleInitial: 'Middle Initial',
  dateOfBirth: 'Date of Birth',
  socialSecurityNumber: 'Social Security Number',
  streetAddress: 'Street Address',
  apartmentUnit: 'Apartment / Unit',
  city: 'City',
  state: 'State',
  zipCode: 'ZIP Code',
  phoneNumber: 'Phone Number',
  email: 'Email',
  other: 'Other Information',
};

function buildPrompt(userInfo: UserInfo): string {
  const fieldList = Object.entries(userInfo)
    .filter(([, value]) => value && String(value).trim().length > 0)
    .map(([key, value]) => `- ${FIELD_LABELS[key] ?? key}: "${value}"`)
    .join('\n');

  return `You are an accessibility assistant helping a person with low vision fill out a paper form using their phone camera.

The user's stored information is:
${fieldList}

You will receive an image of a physical form. Your task is to:
1. Look for empty fields, blank lines, or empty boxes that correspond to one of the user's stored values above.
2. Ignore fields that are already filled in.
3. Return a JSON array of objects. Each object must have exactly these keys:
   - "fieldName": the exact key from the stored user info (e.g. "firstName")
   - "label": the visible label text on the form close to the field (e.g. "First Name")
   - "value": the value from the stored user info that should be written there
   - "box": a normalized bounding box [x1, y1, x2, y2] where x1 < x2, y1 < y2 and all values are between 0.0 and 1.0. Coordinates are relative to the image, with (0,0) at the top-left and (1,1) at the bottom-right.

Rules for bounding boxes:
- The box should encompass the exact empty line, box, or white space where the value should be written.
- Do not include the label text inside the box unless the field is a checkbox.
- Keep the box tight: roughly the size of one handwritten answer line.

If no empty fields matching the stored user info are found, return an empty JSON array [].
Output only valid JSON. Do not include markdown formatting, explanations, or extra text.`;
}

function extractJsonArray(content: string): DetectedField[] {
  const cleaned = content.trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed as DetectedField[];
  } catch {
    // fall through
  }

  // Try extracting from a markdown code block
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (Array.isArray(parsed)) return parsed as DetectedField[];
    } catch {
      // fall through
    }
  }

  // Otherwise search for the first '[' ... ']' array
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed as DetectedField[];
    } catch {
      // fall through
    }
  }

  return [];
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post('/api/analyze', async (req: Request, res: Response) => {
  const { image, userInfo }: { image?: string; userInfo?: UserInfo } = req.body;

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Missing image.' });
  }

  if (!userInfo || typeof userInfo !== 'object') {
    return res.status(400).json({ error: 'Missing userInfo.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl =
    process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey || apiKey.includes('your-key')) {
    console.warn('OPENAI_API_KEY is not configured. Returning mock data.');
    return res.json({ fields: [] });
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: buildPrompt(userInfo),
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this captured form image and return the JSON array.',
              },
              {
                type: 'image_url',
                image_url: { url: image, detail: 'low' },
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM request failed:', response.status, errorText);
      return res.status(502).json({ error: 'LLM request failed.' });
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? '[]';
    const fields = extractJsonArray(content);

    res.json({ fields });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Analysis failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`SuperReader backend listening on http://localhost:${PORT}`);
});
