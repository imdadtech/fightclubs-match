import Chip from "../../atoms/Chip";

interface ChipGroupProps {
  label: string;
  hint?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  /** Écart entre le libellé et les puces (par défaut 8 px). */
  labelGap?: string;
  /** Message d'erreur de validation. */
  error?: string;
}

function ChipGroup({
  label,
  hint,
  options,
  value,
  onChange,
  className = "",
  labelGap = "gap-2",
  error,
}: ChipGroupProps) {
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <div className={`flex flex-col ${labelGap} ${className}`}>
      <span className="text-[13px] font-bold">
        {label}
        {hint && <span className="font-medium text-ink-muted"> {hint}</span>}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip key={option} active={value.includes(option)} onClick={() => toggle(option)}>
            {option}
          </Chip>
        ))}
      </div>
      {error && (
        <p role="alert" className="m-0 text-[14px] leading-5 font-bold text-red-deep">
          {error}
        </p>
      )}
    </div>
  );
}

export default ChipGroup;
