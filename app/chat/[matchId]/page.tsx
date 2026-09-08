"use client";

/**
 * app/chat/[matchId]/page.tsx
 * Real-time chat between matched users, powered by Firestore onSnapshot.
 * Messages live in matches/{matchId}/messages/{autoId}.
 */

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchUserProfile } from "@/lib/matching";
import { sendMessage, subscribeMessages } from "@/lib/chat";
import { useAuth } from "@/context/AuthContext";
import type { Message, UserProfile } from "@/lib/types";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}

function ChatContent() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();

  const [other, setOther] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load the other person's profile (match id is "{uidA}_{uidB}" sorted).
  useEffect(() => {
    if (!user) return;
    const [uidA, uidB] = matchId.split("_");
    const otherUid = uidA === user.uid ? uidB : uidA;
    fetchUserProfile(otherUid).then(setOther);
  }, [user, matchId]);

  // Real-time message subscription.
  useEffect(() => {
    if (!matchId) return;
    const unsubscribe = subscribeMessages(
      matchId,
      (msgs) => setMessages(msgs),
      (err) => {
        console.error("[chat] snapshot failed:", err);
        setMessages([]);
      }
    );
    return unsubscribe;
  }, [matchId]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  async function handleSend() {
    if (!user || !draft.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(matchId, user.uid, draft);
      setDraft("");
    } catch {
      alert("Message failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="flex h-screen flex-col bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <a href="/matches" aria-label="Back to matches" className="text-gray-500 hover:text-gray-800">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-rose-100">
          {other?.photos?.[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={other.photos[0]} alt={other.name} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-bold text-rose-500">
              {other?.name?.charAt(0) ?? "…"}
            </span>
          )}
        </div>
        <span className="font-semibold text-gray-900">{other?.name ?? "Loading…"}</span>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages === null ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-4xl">👋</span>
            <p className="mt-2 text-sm text-gray-500">Say hi to {other?.name ?? "your match"}!</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === user?.uid;
            const prev = messages[i - 1];
            const showTime = !prev || m.timestamp - prev.timestamp > 5 * 60 * 1000;
            return (
              <div key={i}>
                {showTime && (
                  <p className="my-2 text-center text-[11px] text-gray-400">
                    {new Date(m.timestamp).toLocaleString(undefined, {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                  </p>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      mine
                        ? "rounded-br-md bg-rose-500 text-white"
                        : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message…"
          maxLength={1000}
          className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-600 active:scale-90 disabled:opacity-40"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.39 1.1l1.6 6.3L14 12l-10.4 1-1.6 6.3a1 1 0 001.4 1.1z" />
          </svg>
        </button>
      </div>
    </main>
  );
}

