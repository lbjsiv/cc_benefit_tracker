"use client";

import type { AvailableBenefit } from "@/lib/types";
import { formatExpirationDate } from "@/lib/format";
import CardBadge from "@/app/components/CardBadge";
import CategoryBadge from "@/app/components/CategoryBadge";
import CheckIcon from "@/app/components/icons/CheckIcon";

interface Props {
  benefit: AvailableBenefit;
  showCardBadge?: boolean;
  actionInProgress: string | null;
  editingExpiration: string | null;
  onSetEditingExpiration: (key: string | null) => void;
  onSaveExpiration: (benefit: AvailableBenefit, value: string) => void;
  onMarkAsUsed: (benefit: AvailableBenefit) => void;
}

export default function AvailableBenefitCard({
  benefit,
  showCardBadge,
  actionInProgress,
  editingExpiration,
  onSetEditingExpiration,
  onSaveExpiration,
  onMarkAsUsed,
}: Props) {
  const editKey = `${benefit.benefit_id}_${benefit.eligibleDate}`;
  const isEditing = editingExpiration === editKey;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {showCardBadge && (
          <CardBadge cardName={benefit.card_name ?? ""} acronym={benefit.card_badge_acronym} color={benefit.card_badge_color} issuer={benefit.card_issuer} size="sm" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={benefit.benefit_category} />
            <span className="text-xs text-muted-foreground">Valid for {benefit.periodLabel}</span>
            {benefit.benefit_type === "free_night" && (
              <>
                <span className="text-xs text-muted-foreground/40">|</span>
                <span className="text-xs text-muted-foreground">Expires:</span>
                {isEditing ? (
                  <input
                    type="date"
                    defaultValue={benefit.expiration_date ?? ""}
                    autoFocus
                    className="bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground"
                    onBlur={(e) => onSaveExpiration(benefit, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSaveExpiration(benefit, (e.target as HTMLInputElement).value);
                      else if (e.key === "Escape") onSetEditingExpiration(null);
                    }}
                  />
                ) : (
                  <button
                    onClick={() => onSetEditingExpiration(editKey)}
                    className="text-xs text-foreground hover:text-primary transition-colors underline decoration-dashed underline-offset-2"
                  >
                    {benefit.expiration_date
                      ? formatExpirationDate(benefit.expiration_date)
                      : "Add Date"}
                  </button>
                )}
              </>
            )}
          </div>
          <p className="font-medium text-sm mt-0.5">
            {benefit.benefit_type === "free_night" ? (
              <span className="text-foreground">{benefit.benefit_description}</span>
            ) : (
              <>
                <span className="text-success font-bold">${Number(benefit.value).toLocaleString()}</span>
                <span className="text-foreground">{" "}{benefit.benefit_description.replace(/^\$[\d,]+\s*/, "")}</span>
              </>
            )}
          </p>
          {benefit.benefit_notes && (
            <p className="text-xs text-muted-foreground mt-0.5">{benefit.benefit_notes}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onMarkAsUsed(benefit)}
        disabled={actionInProgress === benefit.benefit_id}
        className="shrink-0 w-8 h-8 rounded-full border-2 border-muted-foreground/30 hover:border-success hover:bg-success/10 transition-all flex items-center justify-center disabled:opacity-50"
        title="Mark as used"
      >
        <CheckIcon className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
