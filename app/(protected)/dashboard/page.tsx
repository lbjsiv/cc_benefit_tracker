import { createClient } from "@/lib/supabase/server";
import { getCurrentPeriodEligibleDate, type Frequency } from "@/lib/benefits";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: trackedCards } = await supabase
    .from("user_tracked_cards")
    .select("card_id, dim_all_cards(card_id, card_name, card_issuer, image_url)")
    .eq("user_id", user.id);

  const cardIds = trackedCards?.map((tc) => tc.card_id) ?? [];

  let benefits: Array<{
    benefit_id: string;
    card_id: string;
    benefit_description: string;
    benefit_category: string;
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

  const { data: usedBenefits } = await supabase
    .from("user_used_benefits")
    .select("benefit_id, eligible_date")
    .eq("user_id", user.id);

  const usedSet = new Set(
    (usedBenefits ?? []).map((u) => `${u.benefit_id}_${u.eligible_date}`)
  );

  const cards = (trackedCards ?? []).map((tc) => {
    const card = tc.dim_all_cards as unknown as {
      card_id: string;
      card_name: string;
      card_issuer: string;
      image_url: string;
    };

    const cardBenefits = benefits.filter((b) => b.card_id === tc.card_id);
    let availableCount = 0;
    let availableValue = 0;

    cardBenefits.forEach((b) => {
      const eligibleDate = getCurrentPeriodEligibleDate(b.frequency);
      const key = `${b.benefit_id}_${eligibleDate}`;
      if (!usedSet.has(key)) {
        availableCount++;
        availableValue += Number(b.value);
      }
    });

    return {
      card_id: card.card_id,
      card_name: card.card_name,
      card_issuer: card.card_issuer,
      image_url: card.image_url,
      availableCount,
      availableValue,
    };
  });

  const totalAvailableValue = cards.reduce((sum, c) => sum + c.availableValue, 0);

  return (
    <DashboardClient
      cards={cards}
      totalCards={cards.length}
      totalAvailableValue={totalAvailableValue}
    />
  );
}
