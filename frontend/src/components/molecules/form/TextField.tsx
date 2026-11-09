import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Message d'erreur de validation, affiché sous le champ. */
  error?: string;
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="m3 3 18 18" />}
    </svg>
  );
}

/** Règle : tout champ `type="password"` a un œil pour afficher/masquer la valeur. */
/** Caractères autorisés dans un numéro de téléphone : chiffres, +, espaces, points, tirets, parenthèses. */
const sanitizePhone = (value: string) => value.replace(/[^\d+\s.\-()]/g, "");

function TextField({ label, className = "", type, onChange, error, ...props }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const a11y = { "aria-invalid": !!error, "aria-describedby": error ? errorId : undefined };
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id}>{label}</label>
      {isPassword ? (
        <div className="relative">
          <input
            id={id}
            type={visible ? "text" : "password"}
            onChange={onChange}
            style={{ paddingRight: 52 }}
            {...a11y}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center bg-transparent p-0 text-ink-muted hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-ink"
          >
            <EyeIcon off={visible} />
          </button>
        </div>
      ) : (
        <input
          id={id}
          type={type}
          onChange={
            type === "tel" && onChange
              ? (e) => {
                  e.target.value = sanitizePhone(e.target.value);
                  onChange(e);
                }
              : onChange
          }
          {...a11y}
          {...(type === "tel" && { pattern: "\\+?[\\d\\s.\\-()]{6,20}", maxLength: 20 })}
          {...props}
        />
      )}
      {error && (
        <p id={errorId} role="alert" className="m-0 text-[14px] leading-5 font-bold text-red-deep">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;
