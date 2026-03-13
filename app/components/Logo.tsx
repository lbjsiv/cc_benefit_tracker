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
        d="M33 1L34 4.2L37.2 5.2L34 6.2L33 9.4L32 6.2L28.8 5.2L32 4.2L33 1Z"
        className="fill-amber-400"
      />
      {/* Small sparkle */}
      <path
        d="M27.5 0L28 1.5L29.5 2L28 2.5L27.5 4L27 2.5L25.5 2L27 1.5L27.5 0Z"
        className="fill-amber-300"
      />
    </svg>
  );
}
