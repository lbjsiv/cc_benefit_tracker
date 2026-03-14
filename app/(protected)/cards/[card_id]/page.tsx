import { requireAuth } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getNow } from "@/lib/benefits";
import { type BenefitRow, buildBenefitMaps, buildAvailableBenefits, buildUsedBenefitGroups } from "@/lib/benefits-transform";
import BenefitDetailClient from "./BenefitDetailClient";

interface Props {
  params: Promise<{ card_id: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { card_id } = await params;
  const auth = await requireAuth();
  if (!auth) return null;
  const { supabase, user } = auth;

  const { data: tracked } = await supabase
    .from("user_tracked_cards")
    .select("card_id")
    .eq("user_id", user.id)
    .eq("card_id", card_id)
    .single();

  if (!tracked) redirect("/dashboard");

  const { data: card } = await supabase
    .from("dim_all_cards")
    .select("*")
    .eq("card_id", card_id)
    .single();

  if (!card) redirect("/dashboard");

  const { data: benefits } = await supabase
    .from("card_benefits")
    .select("*")
    .eq("card_id", card_id);

  const currentYear = getNow().getFullYear();
  const { data: usedBenefits } = await supabase
    .from("user_used_benefits")
    .select("*, card_benefits(frequency)")
    .eq("user_id", user.id)
    .eq("card_id", card_id)
    .gte("eligible_date", `${currentYear}-01-01`);

  const typedBenefits = (benefits ?? []) as BenefitRow[];
  const usedRows = usedBenefits ?? [];

  const { notesMap, usedMap } = buildBenefitMaps(usedRows);
  const availableBenefits = buildAvailableBenefits(typedBenefits, notesMap, usedMap, undefined, { card_issuer: card.card_issuer });
  const usedBenefitGroups = buildUsedBenefitGroups(typedBenefits, usedRows, undefined, { card_issuer: card.card_issuer });

  return (
    <BenefitDetailClient
      card={card}
      userId={user.id}
      availableBenefits={availableBenefits}
      usedBenefitGroups={usedBenefitGroups}
    />
  );
}
