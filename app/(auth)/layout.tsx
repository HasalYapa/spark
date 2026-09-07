/**
 * app/(auth)/layout.tsx
 * ---------------------
 * Shared shell for all authentication pages (login, register).
 * The (auth) route group keeps these URLs at /login and /register while
 * giving them their own centered, mobile-first layout.
 */

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
