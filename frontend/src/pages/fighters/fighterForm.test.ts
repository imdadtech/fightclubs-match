import { describe, expect, it } from "vitest";
import { initialFighterForm, toFighterInput, validateIdentity, validateProfile } from "./fighterForm";
import type { FighterForm } from "./fighterForm";

const valid: FighterForm = {
  ...initialFighterForm,
  firstName: " Rayan ",
  lastName: "Kaci",
  birthDate: "1999-09-02",
  weights: [81, 71],
  height: "183",
  disciplines: ["BOXE_ANGLAISE", "MUAY_THAI"],
  records: { BOXE_ANGLAISE: { fights: "7", wins: "5" }, MUAY_THAI: { fights: "3", wins: "2" } },
};

describe("validateIdentity", () => {
  it("accepte une fiche complète", () => {
    expect(validateIdentity(valid)).toEqual({});
  });

  it("exige prénom, nom, date de naissance et une catégorie de poids", () => {
    const errors = validateIdentity(initialFighterForm);
    expect(Object.keys(errors).sort()).toEqual(["birthDate", "firstName", "lastName", "weights"]);
  });

  it("la taille est facultative mais bornée", () => {
    expect(validateIdentity({ ...valid, height: "" })).toEqual({});
    expect(validateIdentity({ ...valid, height: "50" }).height).toBeDefined();
  });

  it("refuse une date dans le futur", () => {
    expect(validateIdentity({ ...valid, birthDate: "2999-01-01" }).birthDate).toBeDefined();
  });
});

describe("validateProfile", () => {
  it("exige au moins une discipline", () => {
    expect(validateProfile({ ...valid, disciplines: [], records: {} }, false).disciplines).toBeDefined();
  });

  it("les victoires ne dépassent pas les combats, discipline par discipline", () => {
    const errors = validateProfile({ ...valid, records: { ...valid.records, MUAY_THAI: { fights: "3", wins: "4" } } }, false);
    expect(errors["wins:MUAY_THAI"]).toBeDefined();
    expect(errors["wins:BOXE_ANGLAISE"]).toBeUndefined();
  });

  it("le consentement n'est exigé que dans le parcours par lien", () => {
    expect(validateProfile(valid, false)).toEqual({});
    expect(validateProfile(valid, true).consent).toBeDefined();
    expect(validateProfile({ ...valid, consent: true }, true)).toEqual({});
  });
});

describe("toFighterInput", () => {
  it("nettoie et convertit la saisie pour l'API", () => {
    expect(toFighterInput(valid)).toEqual({
      firstName: "Rayan",
      lastName: "Kaci",
      birthDate: "1999-09-02",
      sex: "MALE",
      weightClassesKg: [71, 81],
      heightCm: 183,
      records: [
        { discipline: "BOXE_ANGLAISE", fights: 7, wins: 5 },
        { discipline: "MUAY_THAI", fights: 3, wins: 2 },
      ],
    });
  });

  it("taille vide → null, palmarès vide → 0", () => {
    const input = toFighterInput({ ...valid, height: "", records: { BOXE_ANGLAISE: { fights: "", wins: "" } }, disciplines: ["BOXE_ANGLAISE"] });
    expect(input.heightCm).toBeNull();
    expect(input.records).toEqual([{ discipline: "BOXE_ANGLAISE", fights: 0, wins: 0 }]);
  });
});
