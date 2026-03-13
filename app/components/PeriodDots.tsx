import type { PeriodDot } from "@/lib/benefits";

interface PeriodDotsProps {
  periods: PeriodDot[];
  onMarkUsed: (period: PeriodDot) => void;
  onUndo: (period: PeriodDot) => void;
}

export default function PeriodDots({ periods, onMarkUsed, onUndo }: PeriodDotsProps) {
  return (
    <div className="mt-3 flex items-end gap-1 flex-wrap">
      {periods.map((period) => (
        <div key={period.eligible_date} className="flex flex-col items-center gap-1">
          {period.isUsed ? (
            <div className="relative group">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center bg-success ${
                  period.canUndo ? "cursor-pointer hover:bg-success/70 transition-colors" : ""
                }`}
                onClick={() => period.canUndo && onUndo(period)}
                title={
                  period.canUndo
                    ? `Used ${new Date(period.used_at!).toLocaleDateString()} — click to undo`
                    : `Used ${new Date(period.used_at!).toLocaleDateString()}`
                }
              >
                <svg className="w-3 h-3 text-success-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {period.canUndo && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Undo
                </span>
              )}
            </div>
          ) : period.isFuture ? (
            <div
              className="w-5 h-5 rounded-full border-2 border-border/50"
              title={`${period.label} (upcoming)`}
            />
          ) : (
            <div className="relative group">
              <div
                className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 cursor-pointer hover:border-success hover:bg-success/10 transition-all"
                onClick={() => onMarkUsed(period)}
                title={`${period.label} — click to mark as used`}
              />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Mark used
              </span>
            </div>
          )}
          <span
            className={`text-[10px] leading-none ${
              period.isFuture ? "text-muted-foreground/40" : "text-muted-foreground"
            }`}
          >
            {period.label}
          </span>
        </div>
      ))}
    </div>
  );
}
