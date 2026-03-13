export type Frequency = "monthly" | "quarterly" | "half-yearly" | "yearly";
export type BenefitType = "credit" | "free_night";

export function getNow(): Date {
  const testDate = process.env.NEXT_PUBLIC_TEST_DATE;
  if (testDate) return new Date(testDate + "T00:00:00");
  return new Date();
}

export function getEligibleDate(date: Date, frequency: Frequency): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  switch (frequency) {
    case "monthly":
      return `${year}-${String(month + 1).padStart(2, "0")}-01`;
    case "quarterly": {
      const quarterStartMonth = Math.floor(month / 3) * 3;
      return `${year}-${String(quarterStartMonth + 1).padStart(2, "0")}-01`;
    }
    case "half-yearly": {
      const halfStartMonth = month < 6 ? 0 : 6;
      return `${year}-${String(halfStartMonth + 1).padStart(2, "0")}-01`;
    }
    case "yearly":
      return `${year}-01-01`;
  }
}

export function getPeriodLabel(eligibleDate: string, frequency: Frequency): string {
  const date = new Date(eligibleDate + "T00:00:00");
  const year = date.getFullYear();
  const month = date.getMonth();

  switch (frequency) {
    case "monthly":
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "quarterly": {
      const quarter = Math.floor(month / 3) + 1;
      return `Q${quarter} ${year}`;
    }
    case "half-yearly": {
      const half = month < 6 ? 1 : 2;
      return `H${half} ${year}`;
    }
    case "yearly":
      return `${year}`;
  }
}

export function getCurrentPeriodEligibleDate(frequency: Frequency): string {
  return getEligibleDate(getNow(), frequency);
}

export function isWithinRedemptionWindow(eligibleDate: string, frequency: Frequency): boolean {
  const currentEligible = getEligibleDate(getNow(), frequency);
  return eligibleDate === currentEligible;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface PeriodDot {
  eligible_date: string;
  label: string;
  isUsed: boolean;
  used_benefit_id?: string;
  used_at?: string;
  expiration_date?: string | null;
  canUndo: boolean;
  isFuture: boolean;
}

export function generateYearPeriods(frequency: Frequency, year: number): Omit<PeriodDot, "isUsed" | "used_benefit_id" | "used_at" | "canUndo">[] {
  const currentEligible = getEligibleDate(getNow(), frequency);

  switch (frequency) {
    case "monthly":
      return MONTH_LABELS.map((label, i) => {
        const eligible_date = `${year}-${String(i + 1).padStart(2, "0")}-01`;
        return { eligible_date, label, isFuture: eligible_date > currentEligible };
      });
    case "quarterly":
      return [0, 1, 2, 3].map((q) => {
        const eligible_date = `${year}-${String(q * 3 + 1).padStart(2, "0")}-01`;
        return { eligible_date, label: `Q${q + 1}`, isFuture: eligible_date > currentEligible };
      });
    case "half-yearly":
      return [0, 1].map((h) => {
        const eligible_date = `${year}-${String(h * 6 + 1).padStart(2, "0")}-01`;
        return { eligible_date, label: `H${h + 1}`, isFuture: eligible_date > currentEligible };
      });
    case "yearly":
      return [{ eligible_date: `${year}-01-01`, label: `${year}`, isFuture: false }];
  }
}
