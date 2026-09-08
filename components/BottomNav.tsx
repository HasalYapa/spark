"use client";

/**
 * components/BottomNav.tsx
 * Shared mobile bottom navigation: Discover / Matches / Profile.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, MessageCircle, User } from "lucide-react";
import { useNotifications } from "@/lib/useNotifications";

const TABS = [
  { href: "/discover", label: "Discover", icon: Heart },
  { href: "/matches", label: "Matches", icon: MessageCircle },
  { href: "/notifications", label: "Alerts", icon: Bell, badge: true },
  { href: "/dashboard", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                active ? "text-rose-500" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? "fill-rose-100" : ""}`} />
              {label}
              {badge && unreadCount > 0 && (
                <span className="absolute right-1/2 top-1 translate-x-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
