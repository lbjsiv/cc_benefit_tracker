import { requireAuth } from "@/lib/supabase/server";
import { getNow, type BenefitType } from "@/lib/benefits";
import { type BenefitRow, buildBenefitMaps, buildAvailableBenefits, buildUsedBenefitGroups } from "@/lib/benefits-transform";

export async function fetchCombinedBenefits(filterType: BenefitType) {
  const auth = await requireAuth();
  if (!auth) return null;
  const { supabase, user } = auth;

  const { data: trackedCards } = await supabase
    .from("user_tracked_cards")
    .select("card_id, dim_all_cards(card_id, card_name, card_issuer, image_url, card_badge_acronym, card_badge_color)")
    .eq("user_id", user.id);

  const cardIds = (trackedCards ?? []).map((tc) => tc.card_id);
  if (cardIds.length === 0) {
    return { userId: user.id, totalCards: 0, availableBenefits: [], usedBenefitGroups: [] };
  }

  const cardInfoMap = new Map<string, { card_name: string; card_issuer: string; card_badge_acronym: string | null; card_badge_color: string | null }>();
  (trackedCards ?? []).forEach((tc) => {
    const card = tc.dim_all_cards as unknown as {
      card_id: string;
      card_name: string;
      card_issuer: string;
      card_badge_acronym: string | null;
      card_badge_color: string | null;
    };
    cardInfoMap.set(card.card_id, {
      card_name: card.card_name,
      card_issuer: card.card_issuer,
      card_badge_acronym: card.card_badge_acronym,
      card_badge_color: card.card_badge_color,
    });
  });

  const { data: benefitsData } = await supabase
    .from("card_benefits")
    .select("*")
    .in("card_id", cardIds)
    .eq("benefit_type", filterType);

  const benefits = (benefitsData ?? []) as BenefitRow[];

  const currentYear = getNow().getFullYear();
  const { data: usedBenefitsData } = await supabase
    .from("user_used_benefits")
    .select("*, card_benefits(frequency)")
    .eq("user_id", user.id)
    .gte("eligible_date", `${currentYear}-01-01`);

  const benefitIds = new Set(benefits.map((b) => b.benefit_id));
  const relevantRows = (usedBenefitsData ?? []).filter((ub: { benefit_id: string }) => benefitIds.has(ub.benefit_id));

  const { notesMap, usedMap } = buildBenefitMaps(relevantRows);
  const availableBenefits = buildAvailableBenefits(benefits, notesMap, usedMap, cardInfoMap);
  const usedBenefitGroups = buildUsedBenefitGroups(benefits, relevantRows, cardInfoMap);

  return { userId: user.id, totalCards: cardIds.length, availableBenefits, usedBenefitGroups };
}
