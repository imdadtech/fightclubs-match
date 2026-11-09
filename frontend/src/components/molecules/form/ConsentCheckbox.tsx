import { useId } from "react";
import type { ReactNode } from "react";

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  /** Message affiché quand la case est obligatoire mais pas cochée. */
  error?: string;
  className?: string;
}

function ConsentCheckbox({ checked, onChange, children, error, className = "" }: ConsentCheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="flex min-h-11 cursor-pointer items-start gap-3 text-[14px] leading-5 font-medium"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className="m-0 size-6 min-h-6 flex-none p-0 accent-corner-red"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={errorId} role="alert" className="m-0 pl-9 text-[14px] leading-5 font-bold text-red-deep">
          {error}
        </p>
      )}
    </div>
  );
}

export default ConsentCheckbox;
