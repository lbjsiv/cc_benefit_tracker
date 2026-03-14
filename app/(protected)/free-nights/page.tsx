import { fetchCombinedBenefits } from "@/lib/benefits-data";
import CombinedBenefitsClient from "@/app/components/CombinedBenefitsClient";
import EmptyState from "@/app/components/EmptyState";

export default async function FreeNightsPage() {
  const data = await fetchCombinedBenefits("free_night");
  if (!data) return null;

  if (data.totalCards === 0) {
    return <EmptyState />;
  }

  return (
    <CombinedBenefitsClient
      title="Free Night Benefits"
      subtitle="All free night certificates across your tracked cards."
      userId={data.userId}
      availableBenefits={data.availableBenefits}
      usedBenefitGroups={data.usedBenefitGroups}
      mode="free_night"
    />
  );
}
