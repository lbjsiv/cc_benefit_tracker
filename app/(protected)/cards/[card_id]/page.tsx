import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getCurrentPeriodEligibleDate,
  getPeriodLabel,
  generateYearPeriods,
  type Frequency,
} from "@/lib/benefits";
import BenefitDetailClient from "./BenefitDetailClient";

interface Props {
  params: Promise<{ card_id: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { card_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Verify user tracks this card
  const { data: tracked } = await supabase
    .from("user_tracked_cards")
    .select("card_id")
    .eq("user_id", user.id)
    .eq("card_id", card_id)
    .single();

  if (!tracked) redirect("/dashboard");

  // Get card info
  const { data: card } = await supabase
    .from("dim_all_cards")
    .select("*")
    .eq("card_id", card_id)
    .single();

  if (!card) redirect("/dashboard");

  // Get all benefits for this card
  const { data: benefits } = await supabase
    .from("card_benefits")
    .select("*")
    .eq("card_id", card_id);

  // Get all used benefits for this user + card in the current year
  const currentYear = new Date().getFullYear();
  const { data: usedBenefits } = await supabase
    .from("user_used_benefits")
    .select("*, card_benefits(frequency)")
    .eq("user_id", user.id)
    .eq("card_id", card_id)
    .gte("eligible_date", `${currentYear}-01-01`);

  const usedMap = new Map<string, { used_benefit_id: string; eligible_date: string; used_at: string }>();
  (usedBenefits ?? []).forEach((ub) => {
    const key = `${ub.benefit_id}_${ub.eligible_date}`;
    usedMap.set(key, {
      used_benefit_id: ub.used_benefit_id,
      eligible_date: ub.eligible_date,
      used_at: ub.used_at,
    });
  });

  const typedBenefits = (benefits ?? []) as Array<{
    benefit_id: string;
    card_id: string;
    benefit_description: string;
    benefit_category: string;
    value: number;
    frequency: Frequency;
  }>;

  const availableBenefits = typedBenefits
    .map((b) => {
      const eligibleDate = getCurrentPeriodEligibleDate(b.frequency);
      const key = `${b.benefit_id}_${eligibleDate}`;
      const isUsed = usedMap.has(key);
      return {
        ...b,
        eligibleDate,
        periodLabel: getPeriodLabel(eligibleDate, b.frequency),
        isUsed,
      };
    })
    .filter((b) => !b.isUsed);

  // Group used benefits by benefit_id for the period-dot view
  const usedByBenefitId = new Map<string, Array<{ used_benefit_id: string; eligible_date: string; used_at: string }>>();
  (usedBenefits ?? []).forEach((ub) => {
    const arr = usedByBenefitId.get(ub.benefit_id) ?? [];
    arr.push({ used_benefit_id: ub.used_benefit_id, eligible_date: ub.eligible_date, used_at: ub.used_at });
    usedByBenefitId.set(ub.benefit_id, arr);
  });

  const usedBenefitGroups = typedBenefits
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
          canUndo: !!usage && p.eligible_date === getCurrentPeriodEligibleDate(b.frequency),
        };
      });
      return {
        benefit_id: b.benefit_id,
        card_id: b.card_id,
        benefit_description: b.benefit_description,
        benefit_category: b.benefit_category,
        value: b.value,
        frequency: b.frequency,
        usedCount: usages.length,
        totalPeriods: periods.length,
        periods,
      };
    });

  return (
    <BenefitDetailClient
      card={card}
      userId={user.id}
      availableBenefits={availableBenefits}
      usedBenefitGroups={usedBenefitGroups}
    />
  );
}
