"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AuthGuard from "@/components/admin/AuthGuard";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Login page is accessible without authentication — no sidebar, no guard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-warm-white">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <main className="min-h-screen lg:ml-[260px]">
          {/* Mobile hamburger */}
          <div className="sticky top-0 z-30 flex h-14 items-center bg-warm-white/80 px-4 backdrop-blur-sm lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-nino-700 transition-colors hover:bg-nino-100/50"
              aria-label="Open sidebar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <span className="ml-3 font-display text-[13px] font-semibold tracking-[0.2em] text-nino-950">
              NINO JEANS
            </span>
          </div>

          {/* Page content */}
          <div className="px-8 py-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
