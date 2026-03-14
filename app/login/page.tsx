"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";

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
  { top: "6%",  gradient: "from-slate-700 to-slate-900",    duration: "22s", delay: "0s",    rotate: "-4deg",  opacity: "0.18", scale: "0.9"  },
  { top: "24%", gradient: "from-blue-600 to-indigo-800",    duration: "26s", delay: "-5s",   rotate: "3deg",   opacity: "0.15", scale: "0.75" },
  { top: "42%", gradient: "from-emerald-600 to-teal-800",   duration: "19s", delay: "-9s",   rotate: "-6deg",  opacity: "0.18", scale: "1.0"  },
  { top: "60%", gradient: "from-violet-600 to-purple-900",  duration: "24s", delay: "-14s",  rotate: "5deg",   opacity: "0.14", scale: "0.85" },
  { top: "78%", gradient: "from-rose-600 to-pink-800",      duration: "28s", delay: "-7s",   rotate: "-3deg",  opacity: "0.16", scale: "0.7"  },
  { top: "90%", gradient: "from-amber-600 to-orange-800",   duration: "21s", delay: "-18s",  rotate: "4deg",   opacity: "0.12", scale: "0.8"  },
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showLogin, setShowLogin] = useState(false);

  // Sign-up modal state
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (!showSignup && !showLogin) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowSignup(false); setShowLogin(false); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showSignup, showLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);

    if (inviteCode.toLowerCase() !== "smartsiv") {
      setSignupError("Invalid invitation code. Contact the admin for access.");
      setSignupLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email: signupEmail, password: signupPassword });
    if (error) {
      setSignupError(error.message);
      setSignupLoading(false);
    } else {
      setSignupSuccess(true);
      setSignupLoading(false);
      setTimeout(() => setShowSignup(false), 3000);
    }
  };

  const openSignup = () => {
    setSignupEmail("");
    setSignupPassword("");
    setInviteCode("");
    setSignupError(null);
    setSignupSuccess(false);
    setShowSignup(true);
  };

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
        <div className="flex items-center gap-3 mb-3">
          <Logo size="lg" />
          <span className="text-3xl font-bold tracking-tight text-foreground">MyCCPerks</span>
        </div>
        <h1 className="text-lg sm:text-xl font-medium text-foreground mb-2 text-center">
          Your credit card perks, tracked.
        </h1>
        <p className="text-md text-muted-foreground mb-8 text-center max-w-sm">
          Stop forgetting credits that expire periodically.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-col gap-4 mb-8 w-full max-w-sm">
          <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-card/60 backdrop-blur border border-border/40">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <p className="text-md font-semibold text-foreground">No Bank Linking</p>
              <p className="text-sm text-muted-foreground">Your transactions stay yours</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-card/60 backdrop-blur border border-border/40">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-md font-semibold text-foreground">Real Benefits Only</p>
              <p className="text-sm text-muted-foreground">No fluff, no filler benefits</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-card/60 backdrop-blur border border-border/40">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-md font-semibold text-foreground">See What You&apos;re Missing</p>
              <p className="text-sm text-muted-foreground">Never leave money on the table</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-card/60 backdrop-blur border border-border/40">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div>
              <p className="text-md font-semibold text-foreground">Your Data, Your Account</p>
              <p className="text-sm text-muted-foreground">We never share or sell your info</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => { setError(null); setEmail(""); setPassword(""); setShowLogin(true); }}
            className="w-32 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 text-center"
          >
            Log In
          </button>
          <button
            onClick={openSignup}
            className="w-32 py-3 rounded-xl border border-border bg-card/60 backdrop-blur text-foreground font-semibold text-sm hover:bg-card hover:border-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 text-center"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Log In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>

              <div className="flex justify-end -mt-1">
                <a href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Please wait…" : "Log In"}
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Don&apos;t have an account?{" "}
              <button onClick={() => { setShowLogin(false); openSignup(); }} className="text-primary font-semibold hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Sign-up Modal */}
      {showSignup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSignup(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {signupSuccess ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✉️</div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation link to <strong>{signupEmail}</strong>. Click it to activate your account.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-foreground mb-4">Create Account</h2>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-1.5">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      minLength={6}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-invite" className="block text-sm font-medium text-foreground mb-1.5">
                      Invitation Code
                    </label>
                    <input
                      id="signup-invite"
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter your invitation code"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>

                  {signupError && (
                    <div className="bg-destructive/10 text-destructive text-sm px-4 py-2.5 rounded-lg">
                      {signupError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSignup(false)}
                      className="flex-1 py-2.5 px-4 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {signupLoading ? "Please wait…" : "Create Account"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
