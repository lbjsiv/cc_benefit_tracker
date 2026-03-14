"use client";

import Link from "next/link";
import { useBenefitActions } from "@/lib/useBenefitActions";
import type { AvailableBenefit, UsedBenefitGroup, Card } from "@/lib/types";
import CardBadge from "@/app/components/CardBadge";
import AvailableBenefitCard from "@/app/components/AvailableBenefitCard";
import UsedBenefitCard from "@/app/components/UsedBenefitCard";
import EmptyBenefitsState from "@/app/components/EmptyBenefitsState";

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
            {(card.card_points_multipliers || card.card_annual_fee) && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.card_points_multipliers}
                {card.card_points_multipliers && card.card_annual_fee ? " | " : ""}
                {card.card_annual_fee ? `$${card.card_annual_fee.toLocaleString()} Annual Fee` : ""}
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
            <EmptyBenefitsState
              icon="🎉"
              title="Congrats! You've used all your benefits this period"
              subtitle="Check back when the next period starts."
            />
          ) : (
            <div className="space-y-3">
              {available.map((benefit) => (
                <AvailableBenefitCard
                  key={`${benefit.benefit_id}_${benefit.eligibleDate}`}
                  benefit={benefit}
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
            <EmptyBenefitsState
              icon=""
              title=""
              subtitle="No benefits used yet this year. Mark available benefits as used to track them here."
            />
          ) : (
            <div className="space-y-3">
              {activeGroups.map((group) => (
                <UsedBenefitCard
                  key={group.benefit_id}
                  group={group}
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
