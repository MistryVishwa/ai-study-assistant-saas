"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({
  children,
  activePath,
  allowDemo,
}: {
  children: React.ReactNode;
  activePath?: string;
  allowDemo?: boolean;
}) {
  return (
    <ProtectedRoute allowDemo={allowDemo}>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <Sidebar activePath={activePath} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}

