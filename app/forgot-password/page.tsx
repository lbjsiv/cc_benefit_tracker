"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="flex items-center gap-2.5 mb-2">
        <Logo size="lg" />
        <span className="text-2xl font-bold tracking-tight text-foreground">BenefitTracker</span>
      </div>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
        Reset your password
      </p>

      <div className="w-full max-w-sm">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/60 overflow-hidden">
          <div className="p-6">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✉️</div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                  We sent a password reset link to <strong>{email}</strong>. Click it to set a new password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm px-4 py-2.5 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            )}

            <div className="mt-4 text-center">
              <a href="/login" className="text-sm text-primary hover:underline">
                Back to login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
