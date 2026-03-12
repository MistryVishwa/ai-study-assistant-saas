"use client";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath?: string;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar activePath={activePath} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

