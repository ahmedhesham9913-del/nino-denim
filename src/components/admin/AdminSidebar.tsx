"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { onSnapshot, query, where, collection, db } from "@/lib/firebase";

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 7h14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7V3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 7V3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6l7-4 7 4v8l-7 4-7-4V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 6l7 4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 10v8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 6l-7 4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Delivery",
    href: "/admin/delivery",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4h10v9H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 8h3l3 3v2h-6V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="5.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Catalog",
    href: "/admin/catalog",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5a2 2 0 0 1 2-2h3v14H5a2 2 0 0 1-2-2V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 7h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 17v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15 12c2.21 0 4 1.79 4 4v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="10" width="3" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8.5" y="6" width="3" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="3" width="3" height="14" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  const sidebarContent = (
    <div className="flex h-full w-[260px] flex-col bg-nino-950">
      {/* Logo */}
      <div className="flex h-16 items-center px-7">
        <span className="font-display text-[15px] font-semibold tracking-[0.25em] text-white">
          NINO JEANS
        </span>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-white/10" />

      {/* Navigation */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="font-body">{item.label}</span>
              {item.label === "Orders" && pendingCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout + Footer */}
      <div className="px-5 py-4">
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            className="mb-3 text-white/30 hover:text-white/60 text-xs tracking-[0.15em] font-[var(--font-display)] transition-colors"
          >
            LOG OUT
          </button>
          <p className="font-body text-[11px] text-white/20">
            Admin Panel v1.0
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Sidebar */}
          <aside className="relative h-full">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
