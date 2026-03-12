import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const BodySchema = z.object({
  notes: z.string().min(40).max(120000),
  count: z.number().int().min(5).max(50).default(20).optional(),
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
    const count = parsed.data.count ?? 20;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are a flashcard author. Create high-quality Q/A cards grounded ONLY in the provided notes.",
    });

    const prompt = `
Create ${count} flashcards from the notes.

Rules:
- Output VALID JSON only.
- Each card must be short and test a single concept.
- Answers should be concise.

Schema:
{ "cards": [ { "question": "...", "answer": "..." } ] }

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

