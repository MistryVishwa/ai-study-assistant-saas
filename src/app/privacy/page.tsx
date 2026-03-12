export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-400">
          EduPilot is a demo AI study assistant. Do not store sensitive personal data. Study
          content you upload (notes, PDFs) is used only to power features like notes, quizzes, and
          flashcards for your account.
        </p>
        <p className="text-sm text-slate-400">
          Authentication and database storage are handled by Supabase. AI features are powered by
          Google Gemini. Review those providers if you plan to use this template in production.
        </p>
      </div>
    </main>
  );
}

