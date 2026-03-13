import { fetchCombinedBenefits } from "@/lib/benefits-data";
import CombinedBenefitsClient from "@/app/components/CombinedBenefitsClient";

export default async function CreditBenefitsPage() {
  const data = await fetchCombinedBenefits("credit");
  if (!data) return null;

  return (
    <CombinedBenefitsClient
      title="Credit Benefits"
      subtitle="All credit benefits across your tracked cards."
      userId={data.userId}
      availableBenefits={data.availableBenefits}
      usedBenefitGroups={data.usedBenefitGroups}
      mode="credit"
    />
  );
}
