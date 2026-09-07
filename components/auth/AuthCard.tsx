"use client";

/**
 * components/auth/AuthCard.tsx
 * ----------------------------
 * Shared card wrapper for the login/register forms: brand mark, title,
 * subtitle, and consistent spacing so both pages stay visually identical.
 */

import Link from "next/link";
import { Heart } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Text + href for the switch link at the bottom (e.g. to /register). */
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
}

export default function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkHref,
  footerLinkLabel,
}: AuthCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl shadow-rose-100 sm:p-8">
      {/* Brand */}
      <Link
        href="/"
        className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-200"
        aria-label="Spark home"
      >
        <Heart className="h-6 w-6 fill-current" />
      </Link>

      <h1 className="text-center text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-1 text-center text-sm text-gray-500">{subtitle}</p>

      <div className="mt-6">{children}</div>

      <p className="mt-6 text-center text-sm text-gray-500">
        {footerText}{" "}
        <Link
          href={footerLinkHref}
          className="font-semibold text-rose-500 hover:text-rose-600"
        >
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
}
