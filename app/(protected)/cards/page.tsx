import { createClient } from "@/lib/supabase/server";
import CardsLibraryClient from "./CardsLibraryClient";

export default async function CardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: allCards } = await supabase
    .from("dim_all_cards")
    .select("*")
    .order("card_name");

  const { data: tracked } = await supabase
    .from("user_tracked_cards")
    .select("card_id")
    .eq("user_id", user.id);

  const trackedIds = new Set((tracked ?? []).map((t) => t.card_id));

  const cards = (allCards ?? []).map((card) => ({
    ...card,
    isTracked: trackedIds.has(card.card_id),
  }));

  return <CardsLibraryClient cards={cards} userId={user.id} />;
}
