"use client";

/** Save + send, with one last check (sending can't be undone). */
export function SendButton() {
  return (
    <button
      name="send"
      value="1"
      onClick={(e) => { if (!confirm("Send this now? It goes straight to inboxes, emails and phones, and can't be unsent.")) e.preventDefault(); }}
      className="rounded-full bg-honey px-8 py-3 font-medium text-black hover:bg-white"
    >
      Send now →
    </button>
  );
}
