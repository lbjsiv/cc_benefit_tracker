import Image from "next/image";

const ISSUER_LOGOS: Record<string, string> = {
  "American Express": "/amex.png",
  "Chase": "/chase.png",
};

interface CardBadgeProps {
  cardName: string;
  acronym?: string | null;
  color?: string | null;
  issuer?: string;
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

function hexToHsl(hex: string): [number, number, number] {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function hslString(h: number, s: number, l: number): string {
  return `hsl(${((h % 360) + 360) % 360}, ${s}%, ${l}%)`;
}

export default function CardBadge({ cardName, acronym, color, issuer, size = "sm" }: CardBadgeProps) {
  const displayAcronym = acronym || getFallbackAcronym(cardName);
  const bgColor = color || "#737373";
  const isLg = size === "lg";
  const dim = isLg ? "w-14 h-14" : "w-12 h-12";
  const fontSize = isLg ? "text-sm" : "text-xs";
  const logoSrc = issuer ? ISSUER_LOGOS[issuer] : undefined;
  const logoDim = isLg ? 20 : 16;

  const [h, s, l] = hexToHsl(bgColor);
  const from = hslString(h - 25, Math.min(s + 10, 100), Math.min(l + 8, 65));
  const to = hslString(h + 25, Math.min(s + 10, 100), Math.min(l + 8, 65));

  return (
    <div className="relative shrink-0">
      <div
        className={`rounded-full flex items-center justify-center ${dim}`}
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        <span className={`font-semibold text-white tracking-wide ${fontSize}`}>
          {displayAcronym}
        </span>
      </div>
      {logoSrc && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white shadow-sm border border-border flex items-center justify-center"
          style={{ width: logoDim + 4, height: logoDim + 4 }}
        >
          <Image
            src={logoSrc}
            alt={issuer ?? ""}
            width={logoDim}
            height={logoDim}
            className="rounded-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
