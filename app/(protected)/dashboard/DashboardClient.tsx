"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { getNow } from "@/lib/benefits";
import CardBadge from "@/app/components/CardBadge";

interface CardSummary {
  card_id: string;
  card_name: string;
  card_issuer: string;
  image_url: string;
  card_badge_acronym?: string | null;
  card_badge_color?: string | null;
  card_points_multipliers?: string | null;
  availableCount: number;
  availableValue: number;
  availableFreeNights: number;
  usedCreditsValue: number;
  usedFreeNights: number;
}

interface Props {
  cards: CardSummary[];
  totalCards: number;
  totalAvailableValue: number;
  totalAvailableFreeNights: number;
  totalUsedCreditsValue: number;
  totalUsedFreeNights: number;
}

export default function DashboardClient({ cards, totalCards, totalAvailableValue, totalAvailableFreeNights, totalUsedCreditsValue, totalUsedFreeNights }: Props) {
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Available Credits in {getNow().toLocaleDateString("en-US", { month: "long" })}</p>
          <p className="text-2xl sm:text-3xl font-bold text-success mt-1">
            ${totalAvailableValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Used Credits in {getNow().getFullYear()}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            ${totalUsedCreditsValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Available Free Nights in {getNow().toLocaleDateString("en-US", { month: "long" })}</p>
          <p className="text-2xl sm:text-3xl font-bold text-success mt-1">
            {totalAvailableFreeNights}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Used Free Nights in {getNow().getFullYear()}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            {totalUsedFreeNights}
          </p>
        </div>
      </div>

      {/* Header + Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Your Cards</h2>
        <Link
          href="/cards"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:opacity-90 transition-opacity"
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
            {confirmCardId === card.card_id && (
              <div className="absolute inset-0 z-10 bg-card/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
                <p className="text-sm font-medium text-foreground">Remove this card?</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveCard(card.card_id)}
                    disabled={removingCardId === card.card_id}
                    className="text-sm py-1.5 px-4 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {removingCardId === card.card_id ? "Removing…" : "Remove"}
                  </button>
                  <button
                    onClick={() => setConfirmCardId(null)}
                    className="text-sm py-1.5 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-80"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!confirmCardId || confirmCardId !== card.card_id ? (
              <button
                onClick={() => setConfirmCardId(card.card_id)}
                className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Remove card"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
            <Link href={`/cards/${card.card_id}`} className="block px-4 py-4">
              <div className="flex items-center gap-4">
                <CardBadge cardName={card.card_name} acronym={card.card_badge_acronym} color={card.card_badge_color} />
                <div className="min-w-0 pr-6">
                  <h3 className="font-semibold text-foreground truncate">{card.card_name}</h3>
                  {card.card_points_multipliers && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{card.card_points_multipliers}</p>
                  )}
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
                      <p className="text-xs font-semibold text-success">+ {card.availableFreeNights} Free Night{card.availableFreeNights !== 1 ? "s" : ""}</p>
                    </div>
                  ) : card.availableFreeNights > 0 ? (
                    <p className="text-sm font-bold text-success">{card.availableFreeNights} Free Night{card.availableFreeNights !== 1 ? "s" : ""}</p>
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
