"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({
  children,
  allowDemo = false,
}: {
  children: React.ReactNode;
  allowDemo?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (allowDemo && typeof window !== "undefined") {
      const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
      if (isDemo) return;
    }
    router.push(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
  }, [allowDemo, loading, pathname, router, user]);

  return <>{children}</>;
}

