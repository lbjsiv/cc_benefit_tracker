interface CardBadgeProps {
  cardName: string;
  acronym?: string | null;
  color?: string | null;
  size?: "sm" | "lg";
}

function getFallbackAcronym(cardName: string): string {
  const acronym = cardName
    .split(/\s+/)
    .filter((w) => w[0] === w[0].toUpperCase())
    .map((w) => w[0])
    .join("")
    .slice(0, 3);
  return acronym || "CC";
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(amount * 255));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(amount * 255));
  const b = Math.min(255, (num & 0xff) + Math.round(amount * 255));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function CardBadge({ cardName, acronym, color, size = "sm" }: CardBadgeProps) {
  const displayAcronym = acronym || getFallbackAcronym(cardName);
  const bgColor = color || "#737373";
  const isLg = size === "lg";
  const dim = isLg ? "w-14 h-14" : "w-12 h-12";
  const fontSize = isLg ? "text-sm" : "text-xs";

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/20 ${dim}`}
      style={{
        background: `linear-gradient(135deg, ${lighten(bgColor, 0.15)} 0%, ${bgColor} 100%)`,
      }}
    >
      <span className={`font-bold text-white tracking-wider ${fontSize}`}>
        {displayAcronym}
      </span>
    </div>
  );
}
