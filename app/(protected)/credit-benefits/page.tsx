import { fetchCombinedBenefits } from "@/lib/benefits-data";
import CombinedBenefitsClient from "@/app/components/CombinedBenefitsClient";
import EmptyState from "@/app/components/EmptyState";

export default async function CreditBenefitsPage() {
  const data = await fetchCombinedBenefits("credit");
  if (!data) return null;

  if (data.totalCards === 0) {
    return <EmptyState />;
  }

  return (
    <CombinedBenefitsClient
      title="Credit Benefits"
      subtitle="All credits across your tracked cards. Membership benefits (e.g. lounge access, status) are not included."
      userId={data.userId}
      availableBenefits={data.availableBenefits}
      usedBenefitGroups={data.usedBenefitGroups}
      mode="credit"
    />
  );
}
