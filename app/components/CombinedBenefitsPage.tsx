import { fetchCombinedBenefits } from "@/lib/benefits-data";
import type { BenefitType } from "@/lib/benefits";
import CombinedBenefitsClient from "@/app/components/CombinedBenefitsClient";
import EmptyState from "@/app/components/EmptyState";

const PAGE_CONFIG = {
  credit: {
    title: "Credit Benefits",
    subtitle: "All credits across your tracked cards. Membership benefits (e.g. lounge access, status) are not included.",
  },
  free_night: {
    title: "Free Night Benefits",
    subtitle: "All free night certificates across your tracked cards.",
  },
} as const;

export default async function CombinedBenefitsPage({ mode }: { mode: BenefitType }) {
  const data = await fetchCombinedBenefits(mode);
  if (!data) return null;

  if (data.totalCards === 0) {
    return <EmptyState />;
  }

  const config = PAGE_CONFIG[mode];

  return (
    <CombinedBenefitsClient
      title={config.title}
      subtitle={config.subtitle}
      userId={data.userId}
      availableBenefits={data.availableBenefits}
      usedBenefitGroups={data.usedBenefitGroups}
      mode={mode}
    />
  );
}
