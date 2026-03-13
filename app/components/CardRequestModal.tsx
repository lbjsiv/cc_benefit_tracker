"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  onClose: () => void;
}

const MAX_CHARS = 500;

export default function CardRequestModal({ userId, onClose }: Props) {
  const supabase = createClient();
  const [requestDetails, setRequestDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDetails.trim()) return;

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("card_requests").insert({
      user_id: userId,
      request_details: requestDetails.trim(),
    });

    if (insertError) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-foreground font-semibold">Request submitted!</p>
            <p className="text-muted-foreground text-sm mt-1">Thanks for letting us know.</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-foreground mb-1">Request a Card</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Tell us which card you&apos;d like us to add.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  ref={textareaRef}
                  value={requestDetails}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) setRequestDetails(e.target.value);
                  }}
                  placeholder="e.g. Capital One Venture X — I'd like the travel credit and lounge access benefits tracked."
                  rows={4}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {requestDetails.length}/{MAX_CHARS}
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !requestDetails.trim()}
                  className="flex-1 py-2 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
