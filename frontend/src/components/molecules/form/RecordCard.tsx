import TextField from "./TextField";

interface RecordCardProps {
  /** Nom de la discipline, ex. « Boxe anglaise ». */
  discipline: string;
  fights: string;
  wins: string;
  onChange: (patch: { fights?: string; wins?: string }) => void;
  /** Erreur sur le nombre de victoires (ex. plus de victoires que de combats). */
  winsError?: string;
  className?: string;
}

const digits = (value: string) => value.replace(/\D/g, "").slice(0, 3);

/** Palmarès d'une discipline : combats amateurs et victoires. */
function RecordCard({ discipline, fights, wins, onChange, winsError, className = "" }: RecordCardProps) {
  return (
    <div
      role="group"
      aria-label={`Palmarès ${discipline}`}
      className={`flex flex-col gap-2.5 rounded-2xl border border-line bg-surface-raised p-3.5 ${className}`}
    >
      <span className="font-display text-[16px] leading-5 font-extrabold">Palmarès · {discipline}</span>
      <div className="grid grid-cols-2 gap-x-2.5 min-[900px]:gap-x-4">
        <TextField
          label="Combats amateurs"
          type="text"
          inputMode="numeric"
          value={fights}
          onChange={(e) => onChange({ fights: digits(e.target.value) })}
        />
        <TextField
          label="Victoires"
          type="text"
          inputMode="numeric"
          value={wins}
          error={winsError}
          onChange={(e) => onChange({ wins: digits(e.target.value) })}
        />
      </div>
    </div>
  );
}

export default RecordCard;
