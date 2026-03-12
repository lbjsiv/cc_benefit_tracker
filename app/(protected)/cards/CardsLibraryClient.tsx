"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Card {
  card_id: string;
  card_name: string;
  card_issuer: string;
  image_url: string;
  isTracked: boolean;
}

interface Props {
  cards: Card[];
  userId: string;
}

export default function CardsLibraryClient({ cards, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [addingCardId, setAddingCardId] = useState<string | null>(null);
  const [localTracked, setLocalTracked] = useState<Set<string>>(
    new Set(cards.filter((c) => c.isTracked).map((c) => c.card_id))
  );

  const filteredCards = cards.filter(
    (card) =>
      card.card_name.toLowerCase().includes(search.toLowerCase()) ||
      card.card_issuer.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCard = async (cardId: string) => {
    setAddingCardId(cardId);
    setLocalTracked((prev) => new Set(prev).add(cardId));

    const { error } = await supabase.from("user_tracked_cards").insert({ card_id: cardId, user_id: userId });

    if (error) {
      setLocalTracked((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }

    setAddingCardId(null);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Card Library</h1>
        <p className="text-muted-foreground text-sm">
          Discover credit cards and add them to your dashboard
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by card name or issuer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => {
          const isTracked = localTracked.has(card.card_id);
          return (
            <div
              key={card.card_id}
              className={`bg-card border rounded-2xl p-5 transition-all ${
                isTracked ? "border-success/50 bg-success/5" : "border-border hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-9 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center text-xl shrink-0">
                  💳
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{card.card_name}</h3>
                  <p className="text-sm text-muted-foreground">{card.card_issuer}</p>
                </div>
              </div>
              {isTracked ? (
                <div className="flex items-center gap-2 text-success text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Already tracking
                </div>
              ) : (
                <button
                  onClick={() => handleAddCard(card.card_id)}
                  disabled={addingCardId === card.card_id}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {addingCardId === card.card_id ? "Adding…" : "+ Add to Dashboard"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No cards match your search.</p>
        </div>
      )}
    </div>
  );
}
