import type { BenefitType, PeriodDot } from "@/lib/benefits";

export interface AvailableBenefit {
  benefit_id: string;
  card_id: string;
  card_name?: string;
  card_issuer?: string;
  card_badge_acronym?: string | null;
  card_badge_color?: string | null;
  benefit_description: string;
  benefit_category: string;
  benefit_type: BenefitType;
  value: number;
  frequency: string;
  benefit_notes?: string | null;
  eligibleDate: string;
  periodLabel: string;
  expiration_date?: string | null;
}

export interface UsedBenefitGroup {
  benefit_id: string;
  card_id: string;
  card_name?: string;
  card_issuer?: string;
  card_badge_acronym?: string | null;
  card_badge_color?: string | null;
  benefit_description: string;
  benefit_category: string;
  benefit_type: BenefitType;
  value: number;
  frequency: string;
  benefit_notes?: string | null;
  usedCount: number;
  totalPeriods: number;
  periods: PeriodDot[];
}

export interface Card {
  card_id: string;
  card_name: string;
  card_issuer: string;
  image_url: string;
  card_points_multipliers?: string | null;
  card_badge_acronym?: string | null;
  card_badge_color?: string | null;
}
