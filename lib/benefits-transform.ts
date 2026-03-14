import {
  getCurrentPeriodEligibleDate,
  getPeriodLabel,
  generateYearPeriods,
  getNow,
  type Frequency,
  type BenefitType,
} from "@/lib/benefits";
import type { AvailableBenefit, UsedBenefitGroup } from "@/lib/types";

export interface BenefitRow {
  benefit_id: string;
  card_id: string;
  benefit_description: string;
  benefit_category: string;
  benefit_type: BenefitType;
  value: number;
  frequency: Frequency;
  benefit_notes: string | null;
}

interface UsedBenefitRow {
  benefit_id: string;
  card_id: string;
  eligible_date: string;
  is_used: boolean;
  used_benefit_id: string;
  used_at: string;
  expiration_date: string | null;
}

interface CardInfo {
  card_name: string;
  card_issuer: string;
  card_badge_acronym: string | null;
  card_badge_color: string | null;
}

export function buildBenefitMaps(usedRows: UsedBenefitRow[]) {
  const notesMap = new Map<string, { expiration_date: string | null }>();
  const usedMap = new Map<string, { used_benefit_id: string; eligible_date: string; used_at: string; expiration_date: string | null }>();

  usedRows.forEach((ub) => {
    const key = `${ub.benefit_id}_${ub.eligible_date}`;
    if (ub.is_used) {
      usedMap.set(key, {
        used_benefit_id: ub.used_benefit_id,
        eligible_date: ub.eligible_date,
        used_at: ub.used_at,
        expiration_date: ub.expiration_date ?? null,
      });
    } else {
      notesMap.set(key, { expiration_date: ub.expiration_date ?? null });
    }
  });

  return { notesMap, usedMap };
}

export function buildAvailableBenefits(
  benefits: BenefitRow[],
  notesMap: Map<string, { expiration_date: string | null }>,
  usedMap: Map<string, { used_benefit_id: string; eligible_date: string; used_at: string; expiration_date: string | null }>,
  cardInfoMap?: Map<string, CardInfo>,
  singleCardInfo?: { card_issuer: string },
): AvailableBenefit[] {
  return benefits
    .map((b) => {
      const eligibleDate = getCurrentPeriodEligibleDate(b.frequency);
      const key = `${b.benefit_id}_${eligibleDate}`;
      const info = cardInfoMap?.get(b.card_id);
      const notes = notesMap.get(key);
      return {
        ...b,
        card_name: info?.card_name ?? "",
        card_issuer: singleCardInfo?.card_issuer ?? info?.card_issuer ?? "",
        card_badge_acronym: info?.card_badge_acronym ?? null,
        card_badge_color: info?.card_badge_color ?? null,
        eligibleDate,
        periodLabel: getPeriodLabel(eligibleDate, b.frequency),
        expiration_date: notes?.expiration_date ?? null,
        isUsed: usedMap.has(key),
      };
    })
    .filter((b) => !b.isUsed);
}

export function buildUsedBenefitGroups(
  benefits: BenefitRow[],
  usedRows: UsedBenefitRow[],
  cardInfoMap?: Map<string, CardInfo>,
  singleCardInfo?: { card_issuer: string },
): UsedBenefitGroup[] {
  const currentYear = getNow().getFullYear();

  const usedByBenefitId = new Map<string, Array<{ used_benefit_id: string; eligible_date: string; used_at: string; expiration_date: string | null }>>();
  usedRows.filter((ub) => ub.is_used).forEach((ub) => {
    const arr = usedByBenefitId.get(ub.benefit_id) ?? [];
    arr.push({
      used_benefit_id: ub.used_benefit_id,
      eligible_date: ub.eligible_date,
      used_at: ub.used_at,
      expiration_date: ub.expiration_date ?? null,
    });
    usedByBenefitId.set(ub.benefit_id, arr);
  });

  return benefits
    .filter((b) => usedByBenefitId.has(b.benefit_id))
    .map((b) => {
      const usages = usedByBenefitId.get(b.benefit_id) ?? [];
      const periods = generateYearPeriods(b.frequency, currentYear).map((p) => {
        const usage = usages.find((u) => u.eligible_date === p.eligible_date);
        return {
          ...p,
          isUsed: !!usage,
          used_benefit_id: usage?.used_benefit_id,
          used_at: usage?.used_at,
          expiration_date: usage?.expiration_date ?? null,
          canUndo: !!usage && !p.isFuture,
        };
      });
      const info = cardInfoMap?.get(b.card_id);
      return {
        benefit_id: b.benefit_id,
        card_id: b.card_id,
        card_name: info?.card_name ?? "",
        card_issuer: singleCardInfo?.card_issuer ?? info?.card_issuer ?? "",
        card_badge_acronym: info?.card_badge_acronym ?? null,
        card_badge_color: info?.card_badge_color ?? null,
        benefit_description: b.benefit_description,
        benefit_category: b.benefit_category,
        benefit_type: b.benefit_type,
        value: b.value,
        frequency: b.frequency,
        benefit_notes: b.benefit_notes,
        usedCount: usages.length,
        totalPeriods: periods.length,
        periods,
      };
    });
}
