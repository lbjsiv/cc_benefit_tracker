export interface PointsMultiplier {
  category: string;
  multiplier: string;
}

export interface CardConfig {
  multipliers: PointsMultiplier[];
}

const CARD_CONFIGS: Record<string, CardConfig> = {
  "Amex Platinum": {
    multipliers: [
      { category: "Flights (direct or Amex Travel)", multiplier: "5X" },
      { category: "Hotels (Amex Travel)", multiplier: "5X" },
      { category: "Everything else", multiplier: "1X" },
    ],
  },
  "Chase Sapphire Reserve": {
    multipliers: [
      { category: "Hotels & car rentals (Chase Travel)", multiplier: "10X" },
      { category: "Flights (Chase Travel)", multiplier: "5X" },
      { category: "Dining", multiplier: "3X" },
      { category: "Travel (other)", multiplier: "3X" },
      { category: "Everything else", multiplier: "1X" },
    ],
  },
  "Chase Sapphire Preferred": {
    multipliers: [
      { category: "Travel (Chase Travel)", multiplier: "5X" },
      { category: "Dining", multiplier: "3X" },
      { category: "Online grocery", multiplier: "3X" },
      { category: "Streaming", multiplier: "3X" },
      { category: "Travel (other)", multiplier: "2X" },
      { category: "Everything else", multiplier: "1X" },
    ],
  },
  "Chase IHG One Rewards Premier": {
    multipliers: [
      { category: "IHG purchases", multiplier: "26X" },
      { category: "Travel, dining & gas", multiplier: "5X" },
      { category: "Everything else", multiplier: "3X" },
    ],
  },
  "Chase Marriott Bonvoy Boundless": {
    multipliers: [
      { category: "Marriott purchases", multiplier: "6X" },
      { category: "Groceries", multiplier: "3X" },
      { category: "Everything else", multiplier: "2X" },
    ],
  },
};

export function getCardConfig(cardName: string): CardConfig | null {
  return CARD_CONFIGS[cardName] ?? null;
}
