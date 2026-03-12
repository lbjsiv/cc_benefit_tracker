"use client";

const messages = [
  "Counting your cash…",
  "Maximizing your perks…",
  "Making your wallet happy…",
  "Finding hidden benefits…",
  "Crunching the numbers…",
];

export default function LoadingState() {
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden relative">
        <div className="cash-animation absolute text-2xl -top-3">💵</div>
      </div>
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );
}
