import Link from "next/link";
import { fetchCombinedBenefits } from "@/lib/benefits-data";
import CombinedBenefitsClient from "@/app/components/CombinedBenefitsClient";

export default async function CreditBenefitsPage() {
  const data = await fetchCombinedBenefits("credit");
  if (!data) return null;

  if (data.totalCards === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">💳</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No cards tracked yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start by adding your first credit card to track its benefits and never miss a perk again.
        </p>
        <Link
          href="/cards"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          + Add Your First Card
        </Link>
      </div>
    );
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
