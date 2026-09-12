import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spark — Modern Dating",
  description:
    "A mobile-first dating web app: swipe, match, and chat in real time.",
  verification: {
    google: "90jzlzuUXvUO4kXcaOkKB2BsYn6WO_VQZ4zYcJcwBGA",
  },
};

/**
 * Root layout — wraps every route in the AuthProvider so any component
 * (login page, protected pages, etc.) can call useAuth().
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
