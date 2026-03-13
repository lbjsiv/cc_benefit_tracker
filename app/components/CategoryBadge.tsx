import { categoryColors } from "@/lib/constants";

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        categoryColors[category] ?? "bg-secondary text-secondary-foreground"
      }`}
    >
      {category}
    </span>
  );
}
