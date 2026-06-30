import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import OpenAI from "openai";
import { z } from "zod";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 5030);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5029" }));
app.use(express.json({ limit: "12mb" }));

const profileSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]));

const frameRequestSchema = z.object({
  imageDataUrl: z.string().startsWith("data:image/"),
  detectedText: z.string().max(5000).default(""),
  profile: profileSchema
});

const guidanceSchema = z.object({
  found: z.boolean(),
  fieldKey: z.string().nullable(),
  fieldLabel: z.string().nullable(),
  answer: z.string().nullable(),
  instruction: z.string(),
  confidence: z.number().min(0).max(1),
  box: z
    .object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      width: z.number().min(0.02).max(1),
      height: z.number().min(0.02).max(1)
    })
    .nullable()
});

type Guidance = z.infer<typeof guidanceSchema>;

const fallbackGuidance: Guidance = {
  found: false,
  fieldKey: null,
  fieldLabel: null,
  answer: null,
  instruction: "Point the camera at a form field with visible words.",
  confidence: 0,
  box: null
};

function redactProfileForPrompt(profile: Record<string, string | number | boolean | null>) {
  return Object.entries(profile)
    .filter(([, value]) => value !== null && String(value).trim().length > 0)
    .map(([key, value]) => ({ key, value: String(value) }));
}

function parseJsonFromText(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "SuperReader API" });
});

app.post("/api/read-frame", async (req, res) => {
  const parsed = frameRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({
      ...fallbackGuidance,
      instruction: "Add OPENAI_API_KEY to backend/.env, then restart the backend."
    });
    return;
  }

  const { imageDataUrl, detectedText, profile } = parsed.data;
  const profileEntries = redactProfileForPrompt(profile);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (profileEntries.length === 0) {
    res.json({
      ...fallbackGuidance,
      instruction: "Save your information first, then return to Read."
    });
    return;
  }

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.5",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "You are SuperReader, an assistive form-reading system for a low-vision user.",
                "Look at the camera image of a paper or screen form.",
                "Use the OCR text and saved user profile to decide the single most useful field the user should fill next.",
                "Return only compact JSON matching this schema:",
                '{"found":boolean,"fieldKey":string|null,"fieldLabel":string|null,"answer":string|null,"instruction":string,"confidence":number,"box":{"x":number,"y":number,"width":number,"height":number}|null}',
                "The box values must be normalized 0 to 1 relative to the full image. Put the box over the blank area or line where the user should write the answer. If unsure, use the printed label area.",
                "Keep instruction short and direct. Example: Write your first name here.",
                `Detected OCR text: ${detectedText || "(none)"}`,
                `Saved profile entries: ${JSON.stringify(profileEntries)}`
              ].join("\n")
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
              detail: "high"
            }
          ]
        }
      ]
    });

    const rawText = response.output_text;
    const guidance = guidanceSchema.parse(parseJsonFromText(rawText));
    res.json(guidance);
  } catch (error) {
    console.error("OpenAI guidance failed", error);
    res.status(500).json({
      ...fallbackGuidance,
      instruction: "I could not read this frame yet. Hold steady and try again."
    });
  }
});

app.listen(port, () => {
  console.log(`SuperReader API listening on http://localhost:${port}`);
});
