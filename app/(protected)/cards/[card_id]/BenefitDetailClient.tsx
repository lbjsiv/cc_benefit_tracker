"use client";

import Link from "next/link";
import { useBenefitActions } from "@/lib/useBenefitActions";
import type { AvailableBenefit, UsedBenefitGroup, Card } from "@/lib/types";
import CardBadge from "@/app/components/CardBadge";
import CategoryBadge from "@/app/components/CategoryBadge";
import PeriodDots from "@/app/components/PeriodDots";

interface Props {
  card: Card;
  userId: string;
  availableBenefits: AvailableBenefit[];
  usedBenefitGroups: UsedBenefitGroup[];
}

export default function BenefitDetailClient({ card, userId, availableBenefits, usedBenefitGroups }: Props) {
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
  const creditGroups = activeGroups.filter((g) => g.benefit_type === "credit");
  const freeNightGroups = activeGroups.filter((g) => g.benefit_type === "free_night");
  const totalUsedValue = creditGroups.reduce((sum, g) => sum + g.usedCount * Number(g.value), 0);
  const totalFreeNightsUsed = freeNightGroups.reduce((sum, g) => sum + g.usedCount, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
        >
          ← Back to My Cards
        </Link>
        <div className="flex items-center gap-4">
          <CardBadge cardName={card.card_name} acronym={card.card_badge_acronym} color={card.card_badge_color} issuer={card.card_issuer} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{card.card_name}</h1>
            {card.card_points_multipliers && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.card_points_multipliers}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Benefits */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Available Benefits for {now.toLocaleDateString("en-US", { month: "long" })}
            {available.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({available.length})
              </span>
            )}
          </h2>

          {available.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-semibold text-foreground">
                Congrats! You&apos;ve used all your benefits this period
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back when the next period starts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {available.map((benefit) => (
                <div
                  key={benefit.benefit_id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CategoryBadge category={benefit.benefit_category} />
                      <span className="text-xs text-muted-foreground">Valid for {benefit.periodLabel}</span>
                    </div>
                    <p className="font-medium text-sm">
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
                    {benefit.benefit_type === "free_night" && (() => {
                      const editKey = `${benefit.benefit_id}_${benefit.eligibleDate}`;
                      const isEditing = editingExpiration === editKey;
                      return (
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Expires:</span>
                          {isEditing ? (
                            <input
                              type="date"
                              defaultValue={benefit.expiration_date ?? ""}
                              autoFocus
                              className="bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground"
                              onBlur={(e) => saveExpiration(benefit, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveExpiration(benefit, (e.target as HTMLInputElement).value);
                                else if (e.key === "Escape") setEditingExpiration(null);
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingExpiration(editKey)}
                              className="text-foreground hover:text-primary transition-colors underline decoration-dashed underline-offset-2"
                            >
                              {benefit.expiration_date
                                ? new Date(benefit.expiration_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                : "Add Date"}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => markAsUsed(benefit)}
                    disabled={actionInProgress === benefit.benefit_id}
                    className="shrink-0 w-8 h-8 rounded-full border-2 border-muted-foreground/30 hover:border-success hover:bg-success/10 transition-all flex items-center justify-center disabled:opacity-50"
                    title="Mark as used"
                  >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Used Benefits */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Used Benefits for {currentYear}
            {(totalUsedValue > 0 || totalFreeNightsUsed > 0) && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({[
                  totalUsedValue > 0 && `$${totalUsedValue.toLocaleString()} redeemed`,
                  totalFreeNightsUsed > 0 && `${totalFreeNightsUsed} free night${totalFreeNightsUsed !== 1 ? "s" : ""} used`,
                ].filter(Boolean).join(", ")})
              </span>
            )}
          </h2>

          {activeGroups.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No benefits used yet this year. Mark available benefits as used to track them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGroups.map((group) => (
                <div key={group.benefit_id} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CategoryBadge category={group.benefit_category} />
                    <span className="text-xs text-muted-foreground">
                      {group.usedCount}/{group.totalPeriods} used
                    </span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{group.benefit_description}</p>
                  {group.benefit_notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{group.benefit_notes}</p>
                  )}

                  {group.benefit_type === "free_night" && group.periods.filter((p) => p.isUsed && p.expiration_date).map((period) => (
                    <div key={period.eligible_date} className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="text-foreground">
                        {new Date(period.expiration_date! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  ))}

                  <PeriodDots
                    periods={group.periods}
                    onMarkUsed={(period) => markPeriodUsed(group, period)}
                    onUndo={(period) => undoPeriod(group, period)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
