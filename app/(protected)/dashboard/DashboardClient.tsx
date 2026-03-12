"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface CardSummary {
  card_id: string;
  card_name: string;
  card_issuer: string;
  image_url: string;
  availableCount: number;
  availableValue: number;
}

interface Props {
  cards: CardSummary[];
  totalCards: number;
  totalAvailableValue: number;
}

export default function DashboardClient({ cards, totalCards, totalAvailableValue }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [removingCardId, setRemovingCardId] = useState<string | null>(null);
  const [confirmCardId, setConfirmCardId] = useState<string | null>(null);

  const handleRemoveCard = async (cardId: string) => {
    setRemovingCardId(cardId);
    await supabase
      .from("user_tracked_cards")
      .delete()
      .eq("card_id", cardId);
    setRemovingCardId(null);
    setConfirmCardId(null);
    router.refresh();
  };

  if (totalCards === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">💳</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No cards tracked yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start by adding your first credit card to track its benefits and never miss a perk again.
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
      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground font-medium">Tracked Cards</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalCards}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground font-medium">Available Benefits Value</p>
          <p className="text-3xl font-bold text-success mt-1">
            ${totalAvailableValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Header + Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Your Cards</h2>
        <Link
          href="/cards"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          + Add Card
        </Link>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.card_id}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <Link href={`/cards/${card.card_id}`} className="block p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-9 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center text-xl shrink-0">
                  💳
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{card.card_name}</h3>
                  <p className="text-sm text-muted-foreground">{card.card_issuer}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-sm font-semibold text-foreground">
                    {card.availableCount} benefit{card.availableCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-sm font-bold text-success">${card.availableValue}</p>
                </div>
              </div>
            </Link>
            <div className="px-5 pb-4">
              {confirmCardId === card.card_id ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveCard(card.card_id)}
                    disabled={removingCardId === card.card_id}
                    className="flex-1 text-xs py-1.5 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {removingCardId === card.card_id ? "Removing…" : "Confirm Remove"}
                  </button>
                  <button
                    onClick={() => setConfirmCardId(null)}
                    className="flex-1 text-xs py-1.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-80"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCardId(card.card_id)}
                  className="w-full text-xs py-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  Remove Card
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
