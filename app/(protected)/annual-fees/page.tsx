import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CardBadge from "@/app/components/CardBadge";

export default async function AnnualFeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: trackedCards } = await supabase
    .from("user_tracked_cards")
    .select("card_id, dim_all_cards(card_id, card_name, card_issuer, card_badge_acronym, card_badge_color, card_annual_fee)")
    .eq("user_id", user.id);

  const cards = (trackedCards ?? []).map((tc) => {
    const card = tc.dim_all_cards as unknown as {
      card_id: string;
      card_name: string;
      card_issuer: string;
      card_badge_acronym: string | null;
      card_badge_color: string | null;
      card_annual_fee: number | null;
    };
    return card;
  });

  cards.sort((a, b) => (b.card_annual_fee ?? 0) - (a.card_annual_fee ?? 0));

  const totalAnnualFees = cards.reduce((sum, c) => sum + (c.card_annual_fee ?? 0), 0);

  if (cards.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">💳</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No cards tracked yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start by adding your first credit card to track its benefits and annual fees.
        </p>
        <Link
          href="/cards"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          + Add Your First Card
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Annual Fees</h1>
          <p className="text-sm text-muted-foreground mt-1">Fees across all your tracked cards.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-medium">Total</p>
          <p className="text-2xl font-bold text-foreground">${totalAnnualFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <Link
            key={card.card_id}
            href={`/cards/${card.card_id}`}
            className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-4 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <CardBadge
                cardName={card.card_name}
                acronym={card.card_badge_acronym}
                color={card.card_badge_color}
                issuer={card.card_issuer}
              />
              <div>
                <h3 className="font-semibold text-foreground">{card.card_name}</h3>
                <p className="text-xs text-muted-foreground">{card.card_issuer}</p>
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">
              ${(card.card_annual_fee ?? 0).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
