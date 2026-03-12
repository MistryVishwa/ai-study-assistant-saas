export default function LecturesPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Lecture Library (Preview)</h1>
        <p className="text-sm text-slate-400">
          This section is a placeholder for a future lecture management experience where students
          can upload recordings, slides, and transcripts and have EduPilot generate summaries,
          notes, and quizzes.
        </p>
        <p className="text-sm text-slate-400">
          For now, try uploading PDFs or text in the <span className="font-semibold">AI Notes</span>{" "}
          section, or use the <span className="font-semibold">Marketplace</span> to share study
          materials.
        </p>
      </div>
    </main>
  );
}

