"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { getNow } from "@/lib/benefits";
import Logo from "@/app/components/Logo";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-foreground mr-4 sm:mr-8 shrink-0">
              <Logo />
              <span className="hidden sm:inline">MyCCPerks</span>
            </Link>
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              My Cards
            </Link>
            <Link href="/credit-benefits" className={linkClass("/credit-benefits")}>
              My Credits
            </Link>
            <Link href="/free-nights" className={linkClass("/free-nights")}>
              My Free Nights
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {(() => {
                const now = getNow();
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const daysLeft = lastDay - now.getDate();
                return `${now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} (${daysLeft} day${daysLeft !== 1 ? "s" : ""} till end of month)`;
              })()}
            </span>
            {email && (
              <span className="text-xs text-muted-foreground hidden sm:inline">{email}</span>
            )}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
