"use client";

import type { UsedBenefitGroup } from "@/lib/types";
import type { PeriodDot } from "@/lib/benefits";
import { formatExpirationDate } from "@/lib/format";
import CardBadge from "@/app/components/CardBadge";
import CategoryBadge from "@/app/components/CategoryBadge";
import PeriodDots from "@/app/components/PeriodDots";

interface Props {
  group: UsedBenefitGroup;
  showCardBadge?: boolean;
  onMarkPeriodUsed: (group: UsedBenefitGroup, period: PeriodDot) => void;
  onUndo: (group: UsedBenefitGroup, period: PeriodDot) => void;
}

export default function UsedBenefitCard({ group, showCardBadge, onMarkPeriodUsed, onUndo }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-3">
        {showCardBadge && (
          <CardBadge cardName={group.card_name ?? ""} acronym={group.card_badge_acronym} color={group.card_badge_color} issuer={group.card_issuer} size="sm" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={group.benefit_category} />
            <span className="text-xs text-muted-foreground">
              {group.usedCount}/{group.totalPeriods} used
            </span>
          </div>
          <p className="font-medium text-foreground text-sm mt-0.5">{group.benefit_description}</p>
          {group.benefit_notes && (
            <p className="text-xs text-muted-foreground mt-0.5">{group.benefit_notes}</p>
          )}
          {group.benefit_type === "free_night" && group.periods.filter((p) => p.isUsed && p.expiration_date).map((period) => (
            <div key={period.eligible_date} className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Expires:</span>
              <span className="text-foreground">
                {formatExpirationDate(period.expiration_date!)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <PeriodDots
        periods={group.periods}
        onMarkUsed={(period) => onMarkPeriodUsed(group, period)}
        onUndo={(period) => onUndo(group, period)}
      />
    </div>
  );
}
