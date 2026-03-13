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

export default function CardBadge({ cardName, acronym, color, size = "sm" }: CardBadgeProps) {
  const displayAcronym = acronym || getFallbackAcronym(cardName);
  const bgColor = color || "#737373";
  const isLg = size === "lg";

  return (
    <div
      className={`rounded-lg flex items-center justify-center shrink-0 ${
        isLg ? "w-16 h-10" : "w-14 h-9"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <span
        className={`font-bold text-white tracking-wide ${
          isLg ? "text-sm" : "text-xs"
        }`}
      >
        {displayAcronym}
      </span>
    </div>
  );
}
