"use client";

/**
 * app/chat/[matchId]/page.tsx
 * Placeholder for the real-time chat screen (built in the next task).
 * The match param and layout are ready for onSnapshot messages.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <Link href="/matches" aria-label="Back to matches">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <span className="font-semibold text-gray-900">Chat</span>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-4xl">💬</p>
        <h2 className="mt-3 text-lg font-bold text-gray-900">
          Real-time chat coming next
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Match ID: <code className="text-xs">{matchId}</code>
        </p>
      </div>
    </main>
  );
}
