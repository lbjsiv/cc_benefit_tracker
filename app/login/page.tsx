"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";

type Tab = "login" | "signup";

interface FloatingCardConfig {
  top: string;
  gradient: string;
  duration: string;
  delay: string;
  rotate: string;
  opacity: string;
  scale: string;
  reverse?: boolean;
}

const floatingCards: FloatingCardConfig[] = [
  // Right-to-left cards
  { top: "6%",  gradient: "from-slate-700 to-slate-900",    duration: "22s", delay: "0s",    rotate: "-4deg",  opacity: "0.18", scale: "0.9"  },
  { top: "24%", gradient: "from-blue-600 to-indigo-800",    duration: "26s", delay: "-5s",   rotate: "3deg",   opacity: "0.15", scale: "0.75" },
  { top: "42%", gradient: "from-emerald-600 to-teal-800",   duration: "19s", delay: "-9s",   rotate: "-6deg",  opacity: "0.18", scale: "1.0"  },
  { top: "60%", gradient: "from-violet-600 to-purple-900",  duration: "24s", delay: "-14s",  rotate: "5deg",   opacity: "0.14", scale: "0.85" },
  { top: "78%", gradient: "from-rose-600 to-pink-800",      duration: "28s", delay: "-7s",   rotate: "-3deg",  opacity: "0.16", scale: "0.7"  },
  { top: "90%", gradient: "from-amber-600 to-orange-800",   duration: "21s", delay: "-18s",  rotate: "4deg",   opacity: "0.12", scale: "0.8"  },
  // Left-to-right cards (reverse)
  { top: "10%", gradient: "from-cyan-600 to-blue-800",      duration: "25s", delay: "-3s",   rotate: "5deg",   opacity: "0.14", scale: "0.7",  reverse: true },
  { top: "30%", gradient: "from-pink-600 to-rose-800",      duration: "20s", delay: "-10s",  rotate: "-4deg",  opacity: "0.16", scale: "0.85", reverse: true },
  { top: "50%", gradient: "from-indigo-600 to-violet-800",  duration: "27s", delay: "-16s",  rotate: "3deg",   opacity: "0.13", scale: "0.75", reverse: true },
  { top: "68%", gradient: "from-teal-600 to-emerald-800",   duration: "23s", delay: "-6s",   rotate: "-5deg",  opacity: "0.15", scale: "0.9",  reverse: true },
  { top: "84%", gradient: "from-purple-600 to-indigo-900",  duration: "29s", delay: "-20s",  rotate: "4deg",   opacity: "0.12", scale: "0.65", reverse: true },
];

function FloatingCard({ top, gradient, duration, delay, rotate, opacity, scale, reverse }: FloatingCardConfig) {
  return (
    <div
      className={`${reverse ? "floating-card-reverse" : "floating-card"} absolute pointer-events-none`}
      style={{
        top,
        "--card-duration": duration,
        "--card-delay": delay,
        "--card-rotate": rotate,
        "--card-opacity": opacity,
      } as React.CSSProperties}
    >
      <div
        className={`rounded-xl bg-gradient-to-br ${gradient} shadow-2xl p-3.5 flex flex-col justify-between border border-white/10`}
        style={{ width: `${11 * parseFloat(scale)}rem`, height: `${6.5 * parseFloat(scale)}rem` }}
      >
        <div className="flex items-center justify-between">
          <div className="w-7 h-5 rounded-sm bg-amber-300/50" />
          <div className="flex -space-x-1.5">
            <div className="w-4 h-4 rounded-full border border-white/20" />
            <div className="w-4 h-4 rounded-full border border-white/20" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex gap-3">
            <div className="h-1 w-6 rounded-full bg-white/25" />
            <div className="h-1 w-6 rounded-full bg-white/25" />
            <div className="h-1 w-6 rounded-full bg-white/25" />
            <div className="h-1 w-6 rounded-full bg-white/25" />
          </div>
          <div className="flex justify-between items-end">
            <div className="h-1 w-16 rounded-full bg-white/15" />
            <div className="h-1 w-8 rounded-full bg-white/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } else {
      if (inviteCode.toLowerCase() !== "smartsiv") {
        setError("Invalid invite code. Contact the admin for access.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSignupSuccess(true);
        setLoading(false);
      }
    }
  };

  const tabClass = (t: Tab) =>
    `flex-1 py-3 text-sm font-semibold text-center transition-colors cursor-pointer ${
      tab === t
        ? "border-b-2 border-primary text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Full-screen animated card background */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingCards.map((card, i) => (
          <FloatingCard key={i} {...card} />
        ))}
      </div>

      {/* Centered content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Branding */}
        <div className="flex items-center gap-2.5 mb-2">
          <Logo size="lg" />
          <span className="text-2xl font-bold tracking-tight text-foreground">MyCCPerks</span>
        </div>
        <p className="text-sm text-muted-foreground mb-5 text-center max-w-xs">
          Track and maximize every credit card perk.
        </p>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border/40 text-xs text-muted-foreground">
            <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Multi-card tracking
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border/40 text-xs text-muted-foreground">
            <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Period-based benefits
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border/40 text-xs text-muted-foreground">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Savings dashboard
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-sm">
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/60 overflow-hidden">
            <div className="flex border-b border-border/60">
              <button onClick={() => { setTab("login"); setError(null); setSignupSuccess(false); }} className={tabClass("login")}>
                Log In
              </button>
              <button onClick={() => { setTab("signup"); setError(null); setSignupSuccess(false); }} className={tabClass("signup")}>
                Sign Up
              </button>
            </div>

            <div className="p-6">
              {signupSuccess ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">✉️</div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Check your email</h2>
                  <p className="text-sm text-muted-foreground">
                    We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
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
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>

                  {tab === "login" && (
                    <div className="flex justify-end -mt-1">
                      <a
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}

                  {tab === "signup" && (
                    <div>
                      <label htmlFor="inviteCode" className="block text-sm font-medium text-foreground mb-1.5">
                        Invite Code
                      </label>
                      <input
                        id="inviteCode"
                        type="text"
                        required
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Enter your invite code"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      />
                    </div>
                  )}

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
                    {loading ? "Please wait…" : tab === "login" ? "Log In" : "Create Account"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
