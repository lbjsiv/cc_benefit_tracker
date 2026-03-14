"use client";

import { useBenefitActions } from "@/lib/useBenefitActions";
import type { AvailableBenefit, UsedBenefitGroup } from "@/lib/types";
import AvailableBenefitCard from "@/app/components/AvailableBenefitCard";
import UsedBenefitCard from "@/app/components/UsedBenefitCard";
import EmptyBenefitsState from "@/app/components/EmptyBenefitsState";

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
            <EmptyBenefitsState
              icon={isCredit ? "🎉" : "🌙"}
              title={isCredit ? "All credits used this period!" : "No free nights available."}
              subtitle="Check back when the next period starts."
            />
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
            <EmptyBenefitsState
              icon=""
              title=""
              subtitle={isCredit ? "No credits used yet this year." : "No free nights used yet this year."}
            />
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
