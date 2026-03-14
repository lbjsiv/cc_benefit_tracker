interface Props {
  icon: string;
  title: string;
  subtitle: string;
}

export default function EmptyBenefitsState({ icon, title, subtitle }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
