import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const BodySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  text: z.string().min(40).max(120000),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, text } = parsed.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are an expert note-taking assistant. Produce clear study notes for students using simple language and examples when useful.",
    });

    const prompt = [
      "Generate study notes from the following lecture content.",
      "",
      "Return Markdown with these sections (use the headings exactly):",
      "## Summary",
      "## Bullet Notes",
      "## Key Concepts",
      "## Revision Notes",
      "",
      title ? `Title: ${title}` : "",
      "",
      "Lecture content:",
      text,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await model.generateContent(prompt);
    const md = result.response.text();

    return NextResponse.json({ markdown: md });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

