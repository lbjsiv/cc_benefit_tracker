"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import CardBadge from "@/app/components/CardBadge";

interface CardSummary {
  card_id: string;
  card_name: string;
  card_issuer: string;
  image_url: string;
  availableCount: number;
  availableValue: number;
  availableFreeNights: number;
}

interface Props {
  cards: CardSummary[];
  totalCards: number;
  totalAvailableValue: number;
  totalAvailableFreeNights: number;
}

export default function DashboardClient({ cards, totalCards, totalAvailableValue, totalAvailableFreeNights }: Props) {
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
      <div className={`grid grid-cols-1 ${totalAvailableFreeNights > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4 mb-8`}>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground font-medium">Tracked Cards</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalCards}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground font-medium">Available Credits</p>
          <p className="text-3xl font-bold text-success mt-1">
            ${totalAvailableValue.toLocaleString()}
          </p>
        </div>
        {totalAvailableFreeNights > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground font-medium">Available Free Nights</p>
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {totalAvailableFreeNights}
            </p>
          </div>
        )}
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
            className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative"
          >
            {confirmCardId === card.card_id ? (
              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                <button
                  onClick={() => handleRemoveCard(card.card_id)}
                  disabled={removingCardId === card.card_id}
                  className="text-xs py-1 px-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {removingCardId === card.card_id ? "Removing…" : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmCardId(null)}
                  className="text-xs py-1 px-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:opacity-80"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmCardId(card.card_id)}
                className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Remove card"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <Link href={`/cards/${card.card_id}`} className="block px-4 py-4">
              <div className="flex items-center gap-3">
                <CardBadge cardName={card.card_name} />
                <div className="min-w-0 pr-6">
                  <h3 className="font-semibold text-foreground truncate">{card.card_name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-sm font-semibold text-foreground">
                    {card.availableCount} benefit{card.availableCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Value</p>
                  {card.availableValue > 0 && card.availableFreeNights > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-success">${card.availableValue}</p>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">+ {card.availableFreeNights} Free Night{card.availableFreeNights !== 1 ? "s" : ""}</p>
                    </div>
                  ) : card.availableFreeNights > 0 ? (
                    <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{card.availableFreeNights} Free Night{card.availableFreeNights !== 1 ? "s" : ""}</p>
                  ) : (
                    <p className="text-sm font-bold text-success">${card.availableValue}</p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
