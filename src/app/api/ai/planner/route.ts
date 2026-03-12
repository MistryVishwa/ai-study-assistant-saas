import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const BodySchema = z.object({
  subjects: z.array(z.string().min(1).max(60)).min(1).max(12),
  examDate: z.string().min(8).max(32),
  hoursPerDay: z.number().min(0.5).max(16),
  weakSubjects: z.array(z.string().min(1).max(60)).max(12).optional(),
  startDate: z.string().min(8).max(32).optional(),
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

    const { subjects, examDate, hoursPerDay, weakSubjects, startDate } = parsed.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are an AI study planner. Ask for needed info and then produce an actionable schedule with realistic tasks.",
    });

    const prompt = `
Create a full study schedule as JSON.

Student inputs:
- Subjects: ${subjects.join(", ")}
- Exam date: ${examDate}
- Study hours per day: ${hoursPerDay}
- Weak subjects: ${(weakSubjects ?? []).join(", ") || "None specified"}
- Start date (optional): ${startDate ?? "today"}

Requirements:
- Output VALID JSON only (no markdown).
- Create daily tasks from start date up to exam date (inclusive).
- Each day should have 1-3 tasks total, fitting the daily hours.
- Bias more time toward weak subjects.
- Include a weekly summary plan in a top-level field.

Schema:
{
  "weeklyPlan": [ { "weekStart": "YYYY-MM-DD", "focus": "..." } ],
  "tasks": [
    { "date": "YYYY-MM-DD", "subject": "...", "task": "...", "status": "pending" }
  ]
}
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

