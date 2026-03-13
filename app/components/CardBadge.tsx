interface CardBrandConfig {
  acronym: string;
  bg: string;
}

const CARD_BRANDS: Record<string, CardBrandConfig> = {
  "Amex Platinum": { acronym: "AP", bg: "bg-slate-500" },
  "Chase Sapphire Reserve": { acronym: "CSR", bg: "bg-blue-900" },
  "Chase Sapphire Preferred": { acronym: "CSP", bg: "bg-blue-600" },
  "Chase IHG One Rewards Premier": { acronym: "IHG", bg: "bg-green-700" },
  "Chase Marriott Bonvoy Boundless": { acronym: "MBB", bg: "bg-red-800" },
};

function getFallback(cardName: string): CardBrandConfig {
  const acronym = cardName
    .split(/\s+/)
    .filter((w) => w[0] === w[0].toUpperCase())
    .map((w) => w[0])
    .join("")
    .slice(0, 3);
  return { acronym: acronym || "CC", bg: "bg-neutral-500" };
}

interface CardBadgeProps {
  cardName: string;
  size?: "sm" | "lg";
}

export default function CardBadge({ cardName, size = "sm" }: CardBadgeProps) {
  const config = CARD_BRANDS[cardName] ?? getFallback(cardName);
  const isLg = size === "lg";

  return (
    <div
      className={`${config.bg} rounded-lg flex items-center justify-center shrink-0 ${
        isLg ? "w-16 h-10" : "w-14 h-9"
      }`}
    >
      <span
        className={`font-bold text-white tracking-wide ${
          isLg ? "text-sm" : "text-xs"
        }`}
      >
        {config.acronym}
      </span>
    </div>
  );
}
