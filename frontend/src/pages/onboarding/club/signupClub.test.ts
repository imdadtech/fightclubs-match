import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../lib/api";
import { initialClubForm } from "./clubForm";
import type { ClubForm } from "./clubForm";
import { signupClub, toSignupPayload } from "./signupClub";

const form: ClubForm = {
  ...initialClubForm,
  clubName: " Fight Club Paris ",
  disciplines: ["Boxe anglaise", "Muay-thaï", "K-1"],
  city: "Paris",
  postalCode: "75011",
  federations: ["FFB", "Non affilié"],
  firstName: "Jean",
  lastName: "Dupont",
  email: " jean@example.com ",
  password: "motdepasse1",
  phone: "",
  phoneHasWhatsapp: true,
  contacts: { email: true, phone: false },
  acceptedTerms: true,
  sharingConsent: true,
};

afterEach(() => vi.unstubAllGlobals());

describe("toSignupPayload", () => {
  it("convertit les libellés en valeurs d'enum et nettoie les champs", () => {
    const { club, manager } = toSignupPayload(form);
    expect(club.name).toBe("Fight Club Paris");
    expect(club.disciplines).toEqual(["BOXE_ANGLAISE", "MUAY_THAI", "K1"]);
    expect(club.federations).toEqual(["FFB", "NON_AFFILIE"]);
    expect(manager.email).toBe("jean@example.com");
  });

  it("n'envoie ni téléphone ni WhatsApp quand le numéro est vide", () => {
    const { manager } = toSignupPayload(form);
    expect(manager.phone).toBeUndefined();
    expect(manager.phoneHasWhatsapp).toBe(false);
  });
});

describe("signupClub", () => {
  it("poste le JSON avec les cookies de session", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await signupClub(form);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/auth\/signup\/club$/);
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(JSON.parse(init.body).club.name).toBe("Fight Club Paris");
  });

  it("remonte le code d'erreur de l'API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"error":"email_taken"}', { status: 409 })));
    await expect(signupClub(form)).rejects.toMatchObject({ status: 409, code: "email_taken" });
    await expect(signupClub(form)).rejects.toBeInstanceOf(ApiError);
  });
});
