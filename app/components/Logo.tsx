interface LogoProps {
  size?: "sm" | "lg";
}

export default function Logo({ size = "sm" }: LogoProps) {
  const isLg = size === "lg";
  const dim = isLg ? 48 : 32;

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 40 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Back card */}
      <rect x="2" y="4" width="26" height="18" rx="3" className="fill-primary/30" />
      {/* Front card */}
      <rect x="6" y="8" width="26" height="18" rx="3" className="fill-primary" />
      {/* Card stripe */}
      <rect x="6" y="13" width="26" height="4" className="fill-primary-foreground/20" />
      {/* Sparkle top-right */}
      <path
        d="M34 -4L36 4L44 6L36 8L34 16L32 8L24 6L32 4L34 -4Z"
        className="fill-amber-400"
      />
      {/* Small sparkle */}
      <path
        d="M25 -2L26.2 2.5L30.7 3.7L26.2 4.9L25 9.4L23.8 4.9L19.3 3.7L23.8 2.5L25 -2Z"
        className="fill-amber-300"
      />
    </svg>
  );
}
