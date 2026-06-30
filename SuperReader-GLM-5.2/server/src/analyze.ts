import OpenAI from "openai";
import type { UserProfile } from "./types.js";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o";

if (!apiKey) {
  console.warn("[analyze] OPENAI_API_KEY is not set. Analysis calls will fail.");
}

const client = apiKey ? new OpenAI({ apiKey }) : null;

export interface AnalyzeRequest {
  image: string; // data URL, e.g. data:image/jpeg;base64,...
  profile: UserProfile;
}

export interface AnalyzeResult {
  // Normalized 0..1 bounding box of where to write the answer on the frame.
  box: { x: number; y: number; width: number; height: number } | null;
  label: string; // human-readable label of the field, e.g. "First Name"
  value: string; // the value to write, e.g. "Jane"
  instruction: string; // e.g. "Write Jane in the First Name field"
}

const SYSTEM_PROMPT = `You are a low-vision form assistant. The user shows you a photo of a paper form, taken from above with a phone camera.
Your job: find ONE blank fill-in field on the form that matches one of the user's profile fields, and tell the user what to write there and where.

Rules:
- Only match a field if the form actually has a blank space/labeled field for it. If you cannot confidently find any blank fillable field, return null.
- Return exactly ONE field at a time (the most obvious/topmost blank one).
- The box must be the location of the BLANK where the user should write the value, in normalized coordinates 0..1 relative to the image width/height.
- "value" is the user's data formatted the way it should be written on paper (e.g. date as MM/DD/YYYY, phone as (555) 123-4567, SSN as XXX-XX-XXXX).
- "label" is a short human readable name for the field (e.g. "First Name", "Date of Birth", "Street Address").
- "instruction" is a short imperative sentence telling the user what to write, e.g. "Write Jane in the First Name field".
- If the field is a signature line, set value to the user's signature name and label "Signature".
- Do not include any text outside the JSON.

Respond with strict JSON of this shape:
{"box":{"x":0.1,"y":0.2,"width":0.3,"height":0.05},"label":"First Name","value":"Jane","instruction":"Write Jane in the First Name field"}
If no blank fillable field is found, respond with:
{"box":null,"label":"","value":"","instruction":""}`;

export async function analyzeFrame(req: AnalyzeRequest): Promise<AnalyzeResult> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  const profileText = Object.entries(req.profile)
    .filter(([, v]) => v && v.trim() !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const userMessage = `Here is the user's profile information:\n${profileText}\n\nFind the next blank fillable field on this form that matches one of these fields.`;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userMessage },
          { type: "image_url", image_url: { url: req.image, detail: "high" } },
        ],
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: AnalyzeResult;
  try {
    parsed = JSON.parse(raw) as AnalyzeResult;
  } catch {
    parsed = { box: null, label: "", value: "", instruction: "" };
  }

  if (!parsed.box) {
    return { box: null, label: "", value: "", instruction: "" };
  }
  // Clamp box to 0..1
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const b = parsed.box;
  return {
    box: {
      x: clamp(b.x),
      y: clamp(b.y),
      width: clamp(b.width),
      height: clamp(b.height),
    },
    label: parsed.label || "",
    value: parsed.value || "",
    instruction: parsed.instruction || "",
  };
}
