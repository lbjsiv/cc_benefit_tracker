"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { PeriodDot } from "@/lib/benefits";

interface AvailableBenefit {
  benefit_id: string;
  card_id: string;
  benefit_description: string;
  benefit_category: string;
  value: number;
  frequency: string;
  eligibleDate: string;
  periodLabel: string;
}

interface UsedBenefitGroup {
  benefit_id: string;
  card_id: string;
  benefit_description: string;
  benefit_category: string;
  value: number;
  frequency: string;
  usedCount: number;
  totalPeriods: number;
  periods: PeriodDot[];
}

interface Card {
  card_id: string;
  card_name: string;
  card_issuer: string;
  image_url: string;
}

interface Props {
  card: Card;
  userId: string;
  availableBenefits: AvailableBenefit[];
  usedBenefitGroups: UsedBenefitGroup[];
}

const categoryColors: Record<string, string> = {
  Travel: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Dining: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Entertainment: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Rewards: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function BenefitDetailClient({ card, userId, availableBenefits, usedBenefitGroups }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [available, setAvailable] = useState(availableBenefits);
  const [groups, setGroups] = useState(usedBenefitGroups);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  const markAsUsed = async (benefit: AvailableBenefit) => {
    setActionInProgress(benefit.benefit_id);

    setAvailable((prev) => prev.filter((b) => b.benefit_id !== benefit.benefit_id));

    // Update the group if it exists, otherwise create a new group entry
    setGroups((prev) => {
      const existing = prev.find((g) => g.benefit_id === benefit.benefit_id);
      if (existing) {
        return prev.map((g) =>
          g.benefit_id === benefit.benefit_id
            ? {
                ...g,
                usedCount: g.usedCount + 1,
                periods: g.periods.map((p) =>
                  p.eligible_date === benefit.eligibleDate
                    ? { ...p, isUsed: true, used_benefit_id: crypto.randomUUID(), used_at: new Date().toISOString(), canUndo: true }
                    : p
                ),
              }
            : g
        );
      }
      // Benefit not yet in groups — will be added on refresh
      return prev;
    });

    const { error } = await supabase.from("user_used_benefits").insert({
      user_id: userId,
      benefit_id: benefit.benefit_id,
      card_id: benefit.card_id,
      eligible_date: benefit.eligibleDate,
    });

    if (error) {
      setAvailable((prev) => [...prev, benefit]);
      setGroups((prev) =>
        prev.map((g) =>
          g.benefit_id === benefit.benefit_id
            ? {
                ...g,
                usedCount: g.usedCount - 1,
                periods: g.periods.map((p) =>
                  p.eligible_date === benefit.eligibleDate
                    ? { ...p, isUsed: false, used_benefit_id: undefined, used_at: undefined, canUndo: false }
                    : p
                ),
              }
            : g
        )
      );
    }

    setActionInProgress(null);
    router.refresh();
  };

  const undoPeriod = async (group: UsedBenefitGroup, period: PeriodDot) => {
    if (!period.used_benefit_id) return;
    setActionInProgress(period.used_benefit_id);

    // Optimistic: unmark the dot
    setGroups((prev) =>
      prev.map((g) =>
        g.benefit_id === group.benefit_id
          ? {
              ...g,
              usedCount: g.usedCount - 1,
              periods: g.periods.map((p) =>
                p.eligible_date === period.eligible_date
                  ? { ...p, isUsed: false, used_benefit_id: undefined, used_at: undefined, canUndo: false }
                  : p
              ),
            }
          : g
      )
    );

    // Restore to available
    const restored: AvailableBenefit = {
      benefit_id: group.benefit_id,
      card_id: group.card_id,
      benefit_description: group.benefit_description,
      benefit_category: group.benefit_category,
      value: group.value,
      frequency: group.frequency,
      eligibleDate: period.eligible_date,
      periodLabel: period.label,
    };
    setAvailable((prev) => [...prev, restored]);

    const { error } = await supabase
      .from("user_used_benefits")
      .delete()
      .eq("benefit_id", group.benefit_id)
      .eq("eligible_date", period.eligible_date);

    if (error) {
      // Revert
      setGroups((prev) =>
        prev.map((g) =>
          g.benefit_id === group.benefit_id
            ? {
                ...g,
                usedCount: g.usedCount + 1,
                periods: g.periods.map((p) =>
                  p.eligible_date === period.eligible_date ? period : p
                ),
              }
            : g
        )
      );
      setAvailable((prev) => prev.filter((a) => !(a.benefit_id === group.benefit_id && a.eligibleDate === period.eligible_date)));
    }

    setActionInProgress(null);
    router.refresh();
  };

  const totalUsedValue = groups.reduce((sum, g) => sum + g.usedCount * Number(g.value), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center text-2xl shrink-0">
            💳
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{card.card_name}</h1>
            <p className="text-muted-foreground">{card.card_issuer}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Benefits */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            Available Benefits
            {available.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({available.length})
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your available benefits for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}. 
          </p>

          {available.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-semibold text-foreground">
                Congrats! You&apos;ve used all your benefits this period
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back when the next period starts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {available.map((benefit) => (
                <div
                  key={benefit.benefit_id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          categoryColors[benefit.benefit_category] ?? "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {benefit.benefit_category}
                      </span>
                      <span className="text-xs text-muted-foreground">{benefit.periodLabel}</span>
                    </div>
                    <p className="font-medium text-foreground text-sm">{benefit.benefit_description}</p>
                    <p className="text-success font-bold text-sm mt-0.5">${Number(benefit.value).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => markAsUsed(benefit)}
                    disabled={actionInProgress === benefit.benefit_id}
                    className="shrink-0 w-8 h-8 rounded-full border-2 border-muted-foreground/30 hover:border-success hover:bg-success/10 transition-all flex items-center justify-center disabled:opacity-50"
                    title="Mark as used"
                  >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Used Benefits */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            Used Benefits
            {totalUsedValue > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (${totalUsedValue.toLocaleString()} redeemed)
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your redeemed benefits for {currentYear}. Filled dots are periods you&apos;ve used.
          </p>

          {groups.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No benefits used yet this year. Mark available benefits as used to track them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.benefit_id} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        categoryColors[group.benefit_category] ?? "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {group.benefit_category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {group.usedCount}/{group.totalPeriods} used
                    </span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{group.benefit_description}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    ${Number(group.value).toLocaleString()} per {group.frequency === "half-yearly" ? "half" : group.frequency.replace("ly", "")}
                  </p>

                  {/* Period Dots */}
                  <div className="mt-3 flex items-end gap-1 flex-wrap">
                    {group.periods.map((period) => (
                      <div key={period.eligible_date} className="flex flex-col items-center gap-1">
                        {period.isUsed ? (
                          <div className="relative group">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                period.canUndo
                                  ? "bg-success cursor-pointer hover:bg-success/70 transition-colors"
                                  : "bg-success"
                              }`}
                              onClick={() => period.canUndo && undoPeriod(group, period)}
                              title={
                                period.canUndo
                                  ? `Used ${new Date(period.used_at!).toLocaleDateString()} — click to undo`
                                  : `Used ${new Date(period.used_at!).toLocaleDateString()}`
                              }
                            >
                              <svg className="w-3 h-3 text-success-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            {period.canUndo && (
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Undo
                              </span>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-full border-2 ${
                              period.isFuture
                                ? "border-border/50"
                                : "border-muted-foreground/30"
                            }`}
                            title={period.isFuture ? `${period.label} (upcoming)` : `${period.label} (not used)`}
                          />
                        )}
                        <span
                          className={`text-[10px] leading-none ${
                            period.isFuture ? "text-muted-foreground/40" : "text-muted-foreground"
                          }`}
                        >
                          {period.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
