import { createClient } from "@/lib/supabase/server";
import {
  getCurrentPeriodEligibleDate,
  getPeriodLabel,
  generateYearPeriods,
  type Frequency,
  type BenefitType,
} from "@/lib/benefits";

interface BenefitRow {
  benefit_id: string;
  card_id: string;
  benefit_description: string;
  benefit_category: string;
  benefit_type: BenefitType;
  value: number;
  frequency: Frequency;
  benefit_notes: string | null;
}

export async function fetchCombinedBenefits(filterType: BenefitType) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: trackedCards } = await supabase
    .from("user_tracked_cards")
    .select("card_id, dim_all_cards(card_id, card_name, card_issuer, image_url)")
    .eq("user_id", user.id);

  const cardIds = (trackedCards ?? []).map((tc) => tc.card_id);
  if (cardIds.length === 0) {
    return { userId: user.id, availableBenefits: [], usedBenefitGroups: [] };
  }

  const cardNameMap = new Map<string, string>();
  (trackedCards ?? []).forEach((tc) => {
    const card = tc.dim_all_cards as unknown as { card_id: string; card_name: string };
    cardNameMap.set(card.card_id, card.card_name);
  });

  const { data: benefitsData } = await supabase
    .from("card_benefits")
    .select("*")
    .in("card_id", cardIds)
    .eq("benefit_type", filterType);

  const benefits = (benefitsData ?? []) as BenefitRow[];

  const currentYear = new Date().getFullYear();
  const { data: usedBenefitsData } = await supabase
    .from("user_used_benefits")
    .select("*, card_benefits(frequency)")
    .eq("user_id", user.id)
    .gte("eligible_date", `${currentYear}-01-01`);

  const benefitIds = new Set(benefits.map((b) => b.benefit_id));
  const relevantUsed = (usedBenefitsData ?? []).filter((ub) => benefitIds.has(ub.benefit_id));

  const usedMap = new Map<string, { used_benefit_id: string; eligible_date: string; used_at: string }>();
  relevantUsed.forEach((ub) => {
    usedMap.set(`${ub.benefit_id}_${ub.eligible_date}`, {
      used_benefit_id: ub.used_benefit_id,
      eligible_date: ub.eligible_date,
      used_at: ub.used_at,
    });
  });

  const availableBenefits = benefits
    .map((b) => {
      const eligibleDate = getCurrentPeriodEligibleDate(b.frequency);
      const key = `${b.benefit_id}_${eligibleDate}`;
      return {
        ...b,
        card_name: cardNameMap.get(b.card_id) ?? "",
        eligibleDate,
        periodLabel: getPeriodLabel(eligibleDate, b.frequency),
        isUsed: usedMap.has(key),
      };
    })
    .filter((b) => !b.isUsed);

  const usedByBenefitId = new Map<string, Array<{ used_benefit_id: string; eligible_date: string; used_at: string }>>();
  relevantUsed.forEach((ub) => {
    const arr = usedByBenefitId.get(ub.benefit_id) ?? [];
    arr.push({ used_benefit_id: ub.used_benefit_id, eligible_date: ub.eligible_date, used_at: ub.used_at });
    usedByBenefitId.set(ub.benefit_id, arr);
  });

  const usedBenefitGroups = benefits
    .filter((b) => usedByBenefitId.has(b.benefit_id))
    .map((b) => {
      const usages = usedByBenefitId.get(b.benefit_id) ?? [];
      const periods = generateYearPeriods(b.frequency, currentYear).map((p) => {
        const usage = usages.find((u) => u.eligible_date === p.eligible_date);
        return {
          ...p,
          isUsed: !!usage,
          used_benefit_id: usage?.used_benefit_id,
          used_at: usage?.used_at,
          canUndo: !!usage && !p.isFuture,
        };
      });
      return {
        benefit_id: b.benefit_id,
        card_id: b.card_id,
        card_name: cardNameMap.get(b.card_id) ?? "",
        benefit_description: b.benefit_description,
        benefit_category: b.benefit_category,
        benefit_type: b.benefit_type,
        value: b.value,
        frequency: b.frequency,
        benefit_notes: b.benefit_notes,
        usedCount: usages.length,
        totalPeriods: periods.length,
        periods,
      };
    });

  return { userId: user.id, availableBenefits, usedBenefitGroups };
}
