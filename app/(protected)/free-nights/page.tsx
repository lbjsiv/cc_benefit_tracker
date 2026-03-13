import { fetchCombinedBenefits } from "@/lib/benefits-data";
import CombinedBenefitsClient from "@/app/components/CombinedBenefitsClient";

export default async function FreeNightsPage() {
  const data = await fetchCombinedBenefits("free_night");
  if (!data) return null;

  return (
    <CombinedBenefitsClient
      title="Free Night Benefits"
      subtitle="Free night certificates across your tracked cards."
      userId={data.userId}
      availableBenefits={data.availableBenefits}
      usedBenefitGroups={data.usedBenefitGroups}
      mode="free_night"
    />
  );
}
