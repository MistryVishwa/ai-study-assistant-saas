export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Terms of Use</h1>
        <p className="text-sm text-slate-400">
          EduPilot is provided as an educational demo. It is not a production service and comes
          with no guarantees. Always verify AI-generated explanations, notes, and quizzes before
          relying on them for exams or professional work.
        </p>
        <p className="text-sm text-slate-400">
          By using this app, you agree that you are responsible for how you use the content
          generated here and for complying with your institution&apos;s academic integrity
          policies.
        </p>
      </div>
    </main>
  );
}

