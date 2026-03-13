import { createClient } from "@/lib/supabase/server";
import { getNow, getCurrentPeriodEligibleDate, type Frequency, type BenefitType } from "@/lib/benefits";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: trackedCards } = await supabase
    .from("user_tracked_cards")
    .select("card_id, dim_all_cards(card_id, card_name, card_issuer, image_url, card_badge_acronym, card_badge_color, card_points_multipliers, card_annual_fee)")
    .eq("user_id", user.id);

  const cardIds = trackedCards?.map((tc) => tc.card_id) ?? [];

  let benefits: Array<{
    benefit_id: string;
    card_id: string;
    benefit_description: string;
    benefit_category: string;
    benefit_type: BenefitType;
    value: number;
    frequency: Frequency;
  }> = [];

  if (cardIds.length > 0) {
    const { data } = await supabase
      .from("card_benefits")
      .select("*")
      .in("card_id", cardIds);
    benefits = (data ?? []) as typeof benefits;
  }

  const currentYear = getNow().getFullYear();

  const { data: usedBenefitsData } = await supabase
    .from("user_used_benefits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_used", true)
    .gte("eligible_date", `${currentYear}-01-01`);

  const usedRows = usedBenefitsData ?? [];

  // Set for current-period availability check
  const usedCurrentPeriodSet = new Set(
    usedRows.map((ub) => `${ub.benefit_id}_${ub.eligible_date}`)
  );

  // Build a lookup: benefit_id → { value, type }
  const benefitInfoMap = new Map<string, { value: number; type: BenefitType }>();
  benefits.forEach((b) => {
    benefitInfoMap.set(b.benefit_id, { value: Number(b.value), type: b.benefit_type });
  });

  // Group year-to-date usage rows by card
  const usedYearByCard = new Map<string, UsedRow[]>();
  usedRows.forEach((ub) => {
    const arr = usedYearByCard.get(ub.card_id) ?? [];
    arr.push(ub);
    usedYearByCard.set(ub.card_id, arr);
  });

  const cards = (trackedCards ?? []).map((tc) => {
    const card = tc.dim_all_cards as unknown as {
      card_id: string;
      card_name: string;
      card_issuer: string;
      image_url: string;
      card_badge_acronym: string | null;
      card_badge_color: string | null;
      card_points_multipliers: string | null;
      card_annual_fee: number | null;
    };

    const cardBenefits = benefits.filter((b) => b.card_id === tc.card_id);

    // Available = benefits NOT used in the CURRENT period
    let availableCount = 0;
    let availableValue = 0;
    let availableFreeNights = 0;

    cardBenefits.forEach((b) => {
      const eligibleDate = getCurrentPeriodEligibleDate(b.frequency);
      const key = `${b.benefit_id}_${eligibleDate}`;
      if (!usedCurrentPeriodSet.has(key)) {
        availableCount++;
        if (b.benefit_type === "free_night") {
          availableFreeNights++;
        } else {
          availableValue += Number(b.value);
        }
      }
    });

    // Used = ALL usage across the year (not just current period)
    let usedCreditsValue = 0;
    let usedFreeNights = 0;

    const cardUsedRows = usedYearByCard.get(tc.card_id) ?? [];
    cardUsedRows.forEach((ur) => {
      const info = benefitInfoMap.get(ur.benefit_id);
      if (info) {
        if (info.type === "free_night") {
          usedFreeNights++;
        } else {
          usedCreditsValue += info.value;
        }
      }
    });

    return {
      card_id: card.card_id,
      card_name: card.card_name,
      card_issuer: card.card_issuer,
      image_url: card.image_url,
      card_badge_acronym: card.card_badge_acronym,
      card_badge_color: card.card_badge_color,
      card_points_multipliers: card.card_points_multipliers,
      card_annual_fee: card.card_annual_fee,
      availableCount,
      availableValue,
      availableFreeNights,
      usedCreditsValue,
      usedFreeNights,
    };
  });

  const totalAvailableValue = cards.reduce((sum, c) => sum + c.availableValue, 0);
  const totalAvailableFreeNights = cards.reduce((sum, c) => sum + c.availableFreeNights, 0);
  const totalUsedCreditsValue = cards.reduce((sum, c) => sum + c.usedCreditsValue, 0);
  const totalUsedFreeNights = cards.reduce((sum, c) => sum + c.usedFreeNights, 0);
  const totalAnnualFees = cards.reduce((sum, c) => sum + (c.card_annual_fee ?? 0), 0);

  return (
    <DashboardClient
      cards={cards}
      totalCards={cards.length}
      totalAvailableValue={totalAvailableValue}
      totalAvailableFreeNights={totalAvailableFreeNights}
      totalUsedCreditsValue={totalUsedCreditsValue}
      totalUsedFreeNights={totalUsedFreeNights}
      totalAnnualFees={totalAnnualFees}
    />
  );
}
