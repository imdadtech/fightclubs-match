import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ClubOnboarding from "./ClubOnboarding";

function setup() {
  render(
    <MemoryRouter>
      <ClubOnboarding />
    </MemoryRouter>,
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
