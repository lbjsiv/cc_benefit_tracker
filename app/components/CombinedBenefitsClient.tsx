"use client";

import { useBenefitActions } from "@/lib/useBenefitActions";
import type { AvailableBenefit, UsedBenefitGroup } from "@/lib/types";
import CardBadge from "@/app/components/CardBadge";
import CategoryBadge from "@/app/components/CategoryBadge";
import PeriodDots from "@/app/components/PeriodDots";

interface Props {
  title: string;
  subtitle: string;
  userId: string;
  availableBenefits: AvailableBenefit[];
  usedBenefitGroups: UsedBenefitGroup[];
  mode: "credit" | "free_night";
}

export default function CombinedBenefitsClient({ title, subtitle, userId, availableBenefits, usedBenefitGroups, mode }: Props) {
  const {
    available,
    groups,
    actionInProgress,
    editingExpiration,
    setEditingExpiration,
    now,
    currentYear,
    saveExpiration,
    markAsUsed,
    markPeriodUsed,
    undoPeriod,
  } = useBenefitActions(userId, availableBenefits, usedBenefitGroups);

  const activeGroups = groups.filter((g) => g.usedCount > 0);
  const isCredit = mode === "credit";
  const totalUsedValue = isCredit
    ? activeGroups.reduce((sum, g) => sum + g.usedCount * Number(g.value), 0)
    : 0;
  const totalFreeNightsUsed = !isCredit
    ? activeGroups.reduce((sum, g) => sum + g.usedCount, 0)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Available for {now.toLocaleDateString("en-US", { month: "long" })}
            {available.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({available.length})
              </span>
            )}
          </h2>

          {available.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">{isCredit ? "🎉" : "🌙"}</div>
              <p className="font-semibold text-foreground">
                {isCredit ? "All credits used this period!" : "No free nights available."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back when the next period starts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {available.map((benefit) => (
                <AvailableBenefitCard
                  key={`${benefit.benefit_id}_${benefit.eligibleDate}`}
                  benefit={benefit}
                  showCardBadge
                  actionInProgress={actionInProgress}
                  editingExpiration={editingExpiration}
                  onSetEditingExpiration={setEditingExpiration}
                  onSaveExpiration={saveExpiration}
                  onMarkAsUsed={markAsUsed}
                />
              ))}
            </div>
          )}
        </div>

        {/* Used */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Used for {currentYear}
            {(totalUsedValue > 0 || totalFreeNightsUsed > 0) && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({isCredit
                  ? `$${totalUsedValue.toLocaleString()} redeemed`
                  : `${totalFreeNightsUsed} free night${totalFreeNightsUsed !== 1 ? "s" : ""} used`})
              </span>
            )}
          </h2>

          {activeGroups.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                {isCredit ? "No credits used yet this year." : "No free nights used yet this year."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGroups.map((group) => (
                <UsedBenefitCard
                  key={group.benefit_id}
                  group={group}
                  showCardBadge
                  onMarkPeriodUsed={markPeriodUsed}
                  onUndo={undoPeriod}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AvailableBenefitCard({
  benefit,
  showCardBadge,
  actionInProgress,
  editingExpiration,
  onSetEditingExpiration,
  onSaveExpiration,
  onMarkAsUsed,
}: {
  benefit: AvailableBenefit;
  showCardBadge?: boolean;
  actionInProgress: string | null;
  editingExpiration: string | null;
  onSetEditingExpiration: (key: string | null) => void;
  onSaveExpiration: (benefit: AvailableBenefit, value: string) => void;
  onMarkAsUsed: (benefit: AvailableBenefit) => void;
}) {
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
                      ? new Date(benefit.expiration_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  );
}

function UsedBenefitCard({
  group,
  showCardBadge,
  onMarkPeriodUsed,
  onUndo,
}: {
  group: UsedBenefitGroup;
  showCardBadge?: boolean;
  onMarkPeriodUsed: (group: UsedBenefitGroup, period: import("@/lib/benefits").PeriodDot) => void;
  onUndo: (group: UsedBenefitGroup, period: import("@/lib/benefits").PeriodDot) => void;
}) {
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
                {new Date(period.expiration_date! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
