import { cn } from "@/lib/utils";

type LogfoundLogoProps = {
  compact?: boolean;
  className?: string;
  title?: string;
};

/** The single brand mark used across the shell, auth, and workspace surfaces. */
export function LogfoundLogo({
  compact = false,
  className,
  title = "Logfound",
}: LogfoundLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient
            id="logfound-logo-gradient"
            x1="4"
            y1="4"
            x2="28"
            y2="28"
          >
            <stop stopColor="#49D6FF" />
            <stop offset="1" stopColor="#8CEBFF" />
          </linearGradient>
        </defs>
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="9"
          fill="hsl(var(--card))"
          stroke="url(#logfound-logo-gradient)"
          strokeOpacity=".5"
        />
        <path
          d="M9 10.5h5.2c4.5 0 7.8 2.1 7.8 5.5s-3.3 5.5-7.8 5.5H9V10.5Zm4 3.1v4.8h1.2c2.2 0 3.7-.7 3.7-2.4s-1.5-2.4-3.7-2.4H13Z"
          fill="url(#logfound-logo-gradient)"
        />
        <path
          d="M22.5 9.5v13"
          stroke="url(#logfound-logo-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity=".65"
        />
      </svg>
      {!compact && (
        <span className="font-semibold tracking-[-0.02em]">Logfound</span>
      )}
    </span>
  );
}
