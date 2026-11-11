import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../../auth/useAuth";
import ClubOnboarding from "./ClubOnboarding";

/** Journal d'événements : vérifie l'ordre « session relue » puis « redirection ». */
const events: string[] = [];
const refresh = vi.fn(async () => {
  events.push("refresh");
});

function AdversairesPage() {
  events.push("redirect");
  return <h1>Page adversaires</h1>;
}

function setup() {
  events.length = 0;
  refresh.mockClear();
  render(
    <AuthContext.Provider
      value={{ auth: { status: "anonymous" }, login: vi.fn(), logout: vi.fn(), refresh }}
    >
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ClubOnboarding />} />
          <Route path="/adversaires" element={<AdversairesPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return userEvent.setup();
}

const clickMain = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole("button", { name }));

describe("ClubOnboarding : champs vides + bouton principal", () => {
  it("n'affiche aucune erreur avant le clic", () => {
    setup();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("étape 1 : affiche une erreur par champ obligatoire et reste sur l'étape", async () => {
    const user = setup();
    await clickMain(user, "Suivant");

    for (const message of [
      "Indique le nom de ton club.",
      "Choisis au moins une discipline.",
      "Indique ta ville.",
      "Indique ton code postal.",
      "Choisis au moins une option (ou « Non affilié »).",
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "Ton club" })).toBeInTheDocument();
  });

  it("étape 1 : choisir une discipline ou une fédération n'affiche pas d'erreur", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Boxe anglaise" }));
    await user.click(screen.getByRole("button", { name: "FFB" }));

    // Laisse passer les validations asynchrones de Formik.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText("Choisis au moins une discipline.")).not.toBeInTheDocument();
    expect(screen.queryByText("Choisis au moins une option (ou « Non affilié »).")).not.toBeInTheDocument();
  });

  it("étape 2 : affiche les erreurs, dont le consentement, et reste sur l'étape", async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/nom du club/i), "Fight Club Paris");
    await user.type(screen.getByLabelText(/ville/i), "Paris");
    await user.type(screen.getByLabelText(/code postal/i), "75001");
    await user.click(screen.getByRole("button", { name: "Boxe anglaise" }));
    await user.click(screen.getByRole("button", { name: "FFB" }));
    await clickMain(user, "Suivant");

    expect(await screen.findByRole("heading", { name: "Responsable du compte" })).toBeInTheDocument();
    await clickMain(user, "Suivant");

    for (const message of [
      "Indique ton prénom.",
      "Indique ton nom.",
      "Indique ton adresse e-mail.",
      "Choisis un mot de passe.",
      /Coche cette case pour continuer/,
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "Responsable du compte" })).toBeInTheDocument();
  });

  it("étape 3 : affiche les erreurs de contact et de conditions, et ne crée pas le compte", async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/nom du club/i), "Fight Club Paris");
    await user.type(screen.getByLabelText(/ville/i), "Paris");
    await user.type(screen.getByLabelText(/code postal/i), "75001");
    await user.click(screen.getByRole("button", { name: "Boxe anglaise" }));
    await user.click(screen.getByRole("button", { name: "FFB" }));
    await clickMain(user, "Suivant");

    await user.type(await screen.findByLabelText("Prénom"), "Jean");
    await user.type(screen.getByLabelText("Nom"), "Dupont");
    await user.type(screen.getByLabelText("Adresse e-mail"), "jean@example.com");
    await user.type(screen.getByLabelText(/^mot de passe \(8/i), "motdepasse1");
    await user.click(screen.getByRole("checkbox", { name: /partag/i }));
    await clickMain(user, "Suivant");

    expect(await screen.findByRole("heading", { name: "Contact pour organiser le combat" })).toBeInTheDocument();
    await clickMain(user, "Créer le compte du club");

    expect(await screen.findByText("Accepte les conditions pour créer le compte.")).toBeInTheDocument();
  });
});

describe("ClubOnboarding : envoi à l'API", () => {
  afterEach(() => vi.unstubAllGlobals());

  async function fillAllSteps() {
    const user = setup();
    await user.type(screen.getByLabelText(/nom du club/i), "Fight Club Paris");
    await user.type(screen.getByLabelText(/ville/i), "Paris");
    await user.type(screen.getByLabelText(/code postal/i), "75001");
    await user.click(screen.getByRole("button", { name: "Boxe anglaise" }));
    await user.click(screen.getByRole("button", { name: "FFB" }));
    await clickMain(user, "Suivant");

    await user.type(await screen.findByLabelText("Prénom"), "Jean");
    await user.type(screen.getByLabelText("Nom"), "Dupont");
    await user.type(screen.getByLabelText("Adresse e-mail"), "jean@example.com");
    await user.type(screen.getByLabelText(/^mot de passe \(8/i), "motdepasse1");
    await user.click(screen.getByRole("checkbox", { name: /partag/i }));
    await clickMain(user, "Suivant");

    await screen.findByRole("heading", { name: "Contact pour organiser le combat" });
    await user.click(screen.getByRole("checkbox", { name: /conditions d'utilisation/i }));
    await clickMain(user, "Créer le compte du club");
    return user;
  }

  it("redirige vers la recherche d'adversaires quand l'API crée le compte", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await fillAllSteps();

    expect(await screen.findByRole("heading", { name: "Page adversaires" })).toBeInTheDocument();
    // Régression : sans relire la session, l'app se croyait déconnectée et renvoyait vers la connexion.
    expect(events).toEqual(["refresh", "redirect"]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).club.disciplines).toEqual(["BOXE_ANGLAISE"]);
  });

  it("e-mail déjà utilisé : retourne à l'étape 2 avec un message sur le champ", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"error":"email_taken"}', { status: 409 })));
    await fillAllSteps();

    expect(await screen.findByRole("heading", { name: "Responsable du compte" })).toBeInTheDocument();
    expect(screen.getByText("Un compte existe déjà avec cette adresse e-mail.")).toBeInTheDocument();
  });

  it("serveur injoignable : reste sur l'étape 3 avec un message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await fillAllSteps();

    expect(await screen.findByRole("alert")).toHaveTextContent("Une erreur s'est produite. Réessaie dans un instant.");
    expect(screen.getByRole("button", { name: "Créer le compte du club" })).toBeEnabled();
  });
});
