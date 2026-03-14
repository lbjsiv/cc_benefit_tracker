import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">💳</div>
      <h2 className="text-2xl font-bold text-foreground mb-2">No cards tracked yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start by adding your first credit card to track its benefits and never miss a perk again.
      </p>
      <Link
        href="/cards"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary/10 text-primary rounded-xl font-semibold text-sm hover:bg-primary/20 active:scale-95 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Add Your First Card
      </Link>
    </div>
  );
}
