"use client";

/**
 * components/BottomNav.tsx
 * Shared mobile bottom navigation: Discover / Matches / Profile.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, User } from "lucide-react";

const TABS = [
  { href: "/discover", label: "Discover", icon: Heart },
  { href: "/matches", label: "Matches", icon: MessageCircle },
  { href: "/dashboard", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-3">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                active ? "text-rose-500" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? "fill-rose-100" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
