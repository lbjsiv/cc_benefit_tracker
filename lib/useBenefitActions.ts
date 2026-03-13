"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getNow, getCurrentPeriodEligibleDate, generateYearPeriods, type PeriodDot, type Frequency } from "@/lib/benefits";
import type { AvailableBenefit, UsedBenefitGroup } from "@/lib/types";

export function useBenefitActions(
  userId: string,
  initialAvailable: AvailableBenefit[],
  initialGroups: UsedBenefitGroup[],
) {
  const router = useRouter();
  const supabase = createClient();
  const [available, setAvailable] = useState(initialAvailable);
  const [groups, setGroups] = useState(initialGroups);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [editingExpiration, setEditingExpiration] = useState<string | null>(null);

  const now = getNow();
  const currentYear = now.getFullYear();

  const saveExpiration = async (benefit: AvailableBenefit, value: string) => {
    const expiration = value || null;
    setAvailable((prev) =>
      prev.map((b) =>
        b.benefit_id === benefit.benefit_id && b.eligibleDate === benefit.eligibleDate
          ? { ...b, expiration_date: expiration }
          : b
      )
    );
    setEditingExpiration(null);

    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      benefit_id: benefit.benefit_id,
      card_id: benefit.card_id,
      eligible_date: benefit.eligibleDate,
    };
    try {
      const { error } = await supabase.from("user_used_benefits").insert({
        ...insertPayload,
        is_used: false,
        used_at: null,
        expiration_date: expiration,
      });

      if (error?.code === "23505") {
        await supabase
          .from("user_used_benefits")
          .update({ expiration_date: expiration })
          .eq("user_id", userId)
          .eq("benefit_id", benefit.benefit_id)
          .eq("eligible_date", benefit.eligibleDate);
      } else if (error) {
        const { error: fallbackErr } = await supabase.from("user_used_benefits").insert(insertPayload);
        if (fallbackErr?.code === "23505") {
          await supabase
            .from("user_used_benefits")
            .update({ expiration_date: expiration })
            .eq("user_id", userId)
            .eq("benefit_id", benefit.benefit_id)
            .eq("eligible_date", benefit.eligibleDate);
        }
      }
    } catch {
      // Best-effort save for expiration date
    }
  };

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
          card_issuer: benefit.card_issuer,
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

    if (error?.code === "23505") {
      await supabase
        .from("user_used_benefits")
        .delete()
        .eq("user_id", userId)
        .eq("benefit_id", benefit.benefit_id)
        .eq("eligible_date", benefit.eligibleDate);
      await supabase.from("user_used_benefits").insert({
        user_id: userId,
        benefit_id: benefit.benefit_id,
        card_id: benefit.card_id,
        eligible_date: benefit.eligibleDate,
      });
    } else if (error) {
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

    if (error?.code === "23505") {
      await supabase
        .from("user_used_benefits")
        .delete()
        .eq("user_id", userId)
        .eq("benefit_id", group.benefit_id)
        .eq("eligible_date", period.eligible_date);
      await supabase.from("user_used_benefits").insert({
        user_id: userId,
        benefit_id: group.benefit_id,
        card_id: group.card_id,
        eligible_date: period.eligible_date,
      });
    } else if (error) {
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
        card_issuer: group.card_issuer,
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
        expiration_date: period.expiration_date ?? null,
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

  return {
    available,
    groups,
    actionInProgress,
    editingExpiration,
    setEditingExpiration,
    now,
    currentYear,
    saveExpiration,
    markAsUsed,
    markPeriodUsed,
    undoPeriod,
  };
}
