import ChipGroup from "../../../components/molecules/form/ChipGroup";
import TextField from "../../../components/molecules/form/TextField";
import { DISCIPLINES, FEDERATIONS } from "./clubForm";
import type { StepProps } from "./types";

function ClubStepClub({ form, update, errors, touch }: StepProps) {
  return (
    <>
      <TextField
        className="col-span-2"
        label="Nom du club"
        type="text"
        value={form.clubName}
        error={errors.clubName}
        onBlur={() => touch("clubName")}
        onChange={(e) => update({ clubName: e.target.value })}
      />
      <ChipGroup
        className="col-span-2"
        label="Disciplines enseignées"
        hint="(plusieurs choix possibles)"
        options={DISCIPLINES}
        value={form.disciplines}
        error={errors.disciplines}
        onChange={(disciplines) => {
          update({ disciplines });
          touch("disciplines");
        }}
      />
      <TextField
        label="Ville"
        type="text"
        value={form.city}
        error={errors.city}
        onBlur={() => touch("city")}
        onChange={(e) => update({ city: e.target.value })}
      />
      <TextField
        label="Code postal"
        type="text"
        inputMode="numeric"
        autoComplete="postal-code"
        value={form.postalCode}
        error={errors.postalCode}
        onBlur={() => touch("postalCode")}
        onChange={(e) => update({ postalCode: e.target.value.replace(/\D/g, "") })}
      />
      <ChipGroup
        className="col-span-2"
        label="Fédérations"
        hint="(plusieurs choix possibles)"
        options={FEDERATIONS}
        value={form.federations}
        error={errors.federations}
        onChange={(federations) => {
          update({ federations });
          touch("federations");
        }}
      />
    </>
  );
}

export default ClubStepClub;
