interface StepIndicatorProps {
  step: number;
  total?: number;
}

function StepIndicator({ step, total = 3 }: StepIndicatorProps) {
  const label = `Étape ${step} sur ${total}`;
  return (
    <div className="flex w-full flex-col gap-2 min-[900px]:w-70">
      <div className="text-[12px] font-bold tracking-[0.08em] text-ink-muted uppercase">
        {label}
      </div>
      <div className="flex gap-1.5" role="img" aria-label={label}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-[3px] ${i < step ? "bg-corner-red" : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default StepIndicator;
