"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getNow, getCurrentPeriodEligibleDate, generateYearPeriods, type PeriodDot, type Frequency } from "@/lib/benefits";
import type { AvailableBenefit, UsedBenefitGroup } from "@/lib/types";
import CardBadge from "@/app/components/CardBadge";
import CategoryBadge from "@/app/components/CategoryBadge";
import PeriodDots from "@/app/components/PeriodDots";

interface Props {
  title: string;
  subtitle: string;
  userId: string;
  availableBenefits: AvailableBenefit[];
  usedBenefitGroups: UsedBenefitGroup[];
  mode: "credit" | "free_night";
}

export default function CombinedBenefitsClient({ title, subtitle, userId, availableBenefits, usedBenefitGroups, mode }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [available, setAvailable] = useState(availableBenefits);
  const [groups, setGroups] = useState(usedBenefitGroups);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const now = getNow();
  const currentYear = now.getFullYear();

  const markAsUsed = async (benefit: AvailableBenefit) => {
    setActionInProgress(benefit.benefit_id);
    setAvailable((prev) => prev.filter((b) => b.benefit_id !== benefit.benefit_id));

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
      const freq = benefit.frequency as Frequency;
      const periods = generateYearPeriods(freq, currentYear).map((p) => ({
        ...p,
        isUsed: p.eligible_date === benefit.eligibleDate,
        used_benefit_id: p.eligible_date === benefit.eligibleDate ? crypto.randomUUID() : undefined,
        used_at: p.eligible_date === benefit.eligibleDate ? new Date().toISOString() : undefined,
        canUndo: p.eligible_date === benefit.eligibleDate,
      }));
      return [
        ...prev,
        {
          benefit_id: benefit.benefit_id,
          card_id: benefit.card_id,
          card_name: benefit.card_name,
          card_badge_acronym: benefit.card_badge_acronym,
          card_badge_color: benefit.card_badge_color,
          benefit_description: benefit.benefit_description,
          benefit_category: benefit.benefit_category,
          benefit_type: benefit.benefit_type,
          value: benefit.value,
          frequency: benefit.frequency,
          benefit_notes: benefit.benefit_notes,
          usedCount: 1,
          totalPeriods: periods.length,
          periods,
        },
      ];
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

  const markPeriodUsed = async (group: UsedBenefitGroup, period: PeriodDot) => {
    const tempId = crypto.randomUUID();
    setActionInProgress(tempId);

    setGroups((prev) =>
      prev.map((g) =>
        g.benefit_id === group.benefit_id
          ? {
              ...g,
              usedCount: g.usedCount + 1,
              periods: g.periods.map((p) =>
                p.eligible_date === period.eligible_date
                  ? { ...p, isUsed: true, used_benefit_id: tempId, used_at: new Date().toISOString(), canUndo: true }
                  : p
              ),
            }
          : g
      )
    );

    setAvailable((prev) =>
      prev.filter((a) => !(a.benefit_id === group.benefit_id && a.eligibleDate === period.eligible_date))
    );

    const { error } = await supabase.from("user_used_benefits").insert({
      user_id: userId,
      benefit_id: group.benefit_id,
      card_id: group.card_id,
      eligible_date: period.eligible_date,
    });

    if (error) {
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
    }

    setActionInProgress(null);
    router.refresh();
  };

  const undoPeriod = async (group: UsedBenefitGroup, period: PeriodDot) => {
    if (!period.used_benefit_id) return;
    setActionInProgress(period.used_benefit_id);

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

    const isCurrentPeriod = period.eligible_date === getCurrentPeriodEligibleDate(group.frequency as Frequency);
    if (isCurrentPeriod) {
      const restored: AvailableBenefit = {
        benefit_id: group.benefit_id,
        card_id: group.card_id,
        card_name: group.card_name,
        card_badge_acronym: group.card_badge_acronym,
        card_badge_color: group.card_badge_color,
        benefit_description: group.benefit_description,
        benefit_category: group.benefit_category,
        benefit_type: group.benefit_type,
        value: group.value,
        frequency: group.frequency,
        benefit_notes: group.benefit_notes,
        eligibleDate: period.eligible_date,
        periodLabel: period.label,
      };
      setAvailable((prev) => [...prev, restored]);
    }

    const { error } = await supabase
      .from("user_used_benefits")
      .delete()
      .eq("benefit_id", group.benefit_id)
      .eq("eligible_date", period.eligible_date);

    if (error) {
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
      if (isCurrentPeriod) {
        setAvailable((prev) => prev.filter((a) => !(a.benefit_id === group.benefit_id && a.eligibleDate === period.eligible_date)));
      }
    }

    setActionInProgress(null);
    router.refresh();
  };

  const activeGroups = groups.filter((g) => g.usedCount > 0);
  const isCredit = mode === "credit";
  const totalUsedValue = isCredit
    ? activeGroups.reduce((sum, g) => sum + g.usedCount * Number(g.value), 0)
    : 0;
  const totalFreeNightsUsed = !isCredit
    ? activeGroups.reduce((sum, g) => sum + g.usedCount, 0)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Available for {now.toLocaleDateString("en-US", { month: "long" })}
            {available.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({available.length})
              </span>
            )}
          </h2>

          {available.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">{isCredit ? "🎉" : "🌙"}</div>
              <p className="font-semibold text-foreground">
                {isCredit ? "All credits used this period!" : "No free nights available."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back when the next period starts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {available.map((benefit) => (
                <div
                  key={`${benefit.benefit_id}_${benefit.eligibleDate}`}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CardBadge cardName={benefit.card_name ?? ""} acronym={benefit.card_badge_acronym} color={benefit.card_badge_color} size="sm" />
                      <CategoryBadge category={benefit.benefit_category} />
                      <span className="text-xs text-muted-foreground">Valid for {benefit.periodLabel}</span>
                    </div>
                    <p className="font-medium text-sm">
                      {benefit.benefit_type === "free_night" ? (
                        <span className="text-foreground">{benefit.benefit_description}</span>
                      ) : (
                        <>
                          <span className="text-success font-bold">${Number(benefit.value).toLocaleString()}</span>
                          <span className="text-foreground">{" "}{benefit.benefit_description.replace(/^\$[\d,]+\s*/, "")}</span>
                        </>
                      )}
                    </p>
                    {benefit.benefit_notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">{benefit.benefit_notes}</p>
                    )}
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

        {/* Used */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Used for {currentYear}
            {(totalUsedValue > 0 || totalFreeNightsUsed > 0) && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({isCredit
                  ? `$${totalUsedValue.toLocaleString()} redeemed`
                  : `${totalFreeNightsUsed} free night${totalFreeNightsUsed !== 1 ? "s" : ""} used`})
              </span>
            )}
          </h2>

          {activeGroups.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                {isCredit ? "No credits used yet this year." : "No free nights used yet this year."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGroups.map((group) => (
                <div key={group.benefit_id} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CardBadge cardName={group.card_name ?? ""} acronym={group.card_badge_acronym} color={group.card_badge_color} size="sm" />
                    <CategoryBadge category={group.benefit_category} />
                    <span className="text-xs text-muted-foreground">
                      {group.usedCount}/{group.totalPeriods} used
                    </span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{group.benefit_description}</p>
                  {group.benefit_notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{group.benefit_notes}</p>
                  )}

                  <PeriodDots
                    periods={group.periods}
                    onMarkUsed={(period) => markPeriodUsed(group, period)}
                    onUndo={(period) => undoPeriod(group, period)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
