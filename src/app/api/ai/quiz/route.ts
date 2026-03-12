import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const BodySchema = z.object({
  notes: z.string().min(40).max(120000),
  counts: z
    .object({
      mcq: z.number().int().min(0).max(20).default(6),
      tf: z.number().int().min(0).max(20).default(4),
      short: z.number().int().min(0).max(20).default(3),
    })
    .optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { notes } = parsed.data;
    const counts = parsed.data.counts ?? { mcq: 6, tf: 4, short: 3 };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are an assessment author. Create accurate quizzes grounded ONLY in the provided notes.",
    });

    const prompt = `
Create a quiz from these notes.

Rules:
- Output VALID JSON only (no markdown fences, no commentary).
- Each question must include an answer.
- Keep questions unambiguous and directly supported by the notes.

Return schema:
{
  "questions": [
    { "type": "mcq", "question": "...", "options": ["A","B","C","D"], "answerIndex": 0, "explanation": "..." },
    { "type": "tf", "question": "...", "answer": true, "explanation": "..." },
    { "type": "short", "question": "...", "answer": "...", "explanation": "..." }
  ]
}

Counts:
- mcq: ${counts.mcq}
- tf: ${counts.tf}
- short: ${counts.short}

Notes:
${notes}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = JSON.parse(text) as unknown;

    return NextResponse.json(json);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

