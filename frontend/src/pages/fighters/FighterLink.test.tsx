import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import FighterLink from "./FighterLink";

type Reply = { status: number; body: unknown };

/** Simule l'API : `GET /invites/:token` puis `POST /invites/:token`. */
function stubApi(get: Reply, post: Reply = { status: 201, body: { firstName: "Yanis", clubName: "Boxing Club Belleville" } }) {
  const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
    const reply = init?.method === "POST" ? post : get;
    return Promise.resolve(new Response(JSON.stringify(reply.body), { status: reply.status }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function setup() {
  render(
    <MemoryRouter initialEntries={["/combattant/abc"]}>
      <Routes>
        <Route path="/combattant/:token" element={<FighterLink />} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

const club = { status: 200, body: { clubName: "Boxing Club Belleville" } };
const click = (user: ReturnType<typeof userEvent.setup>, name: string) => user.click(screen.getByRole("button", { name }));

async function fillIdentity(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText("Prénom"), "Yanis");
  await user.type(screen.getByLabelText("Nom"), "Mansouri");
  const birth = screen.getByLabelText("Date de naissance");
  await user.type(birth, "2002-03-14");
  await click(user, "−71 kg");
  await click(user, "−75 kg");
  await user.type(screen.getByLabelText("Taille (cm)"), "178");
}

afterEach(() => vi.unstubAllGlobals());

describe("FighterLink : page publique du combattant", () => {
  it("affiche le club qui demande la fiche, sans compte à créer", async () => {
    stubApi(club);
    setup();
    expect(await screen.findByText(/te demande de compléter ta fiche/)).toHaveTextContent("Boxing Club Belleville");
    expect(screen.getByText("Qui es-tu ?")).toBeInTheDocument();
    expect(screen.getByText("Étape 1 sur 2")).toBeInTheDocument();
  });

  it("étape 1 : réclame prénom, nom, date de naissance et une catégorie, et reste sur l'étape", async () => {
    stubApi(club);
    const user = setup();
    await screen.findByText("Qui es-tu ?");
    await click(user, "Suivant");

    for (const message of ["Indique le prénom.", "Indique le nom.", "Indique la date de naissance.", "Choisis au moins une catégorie de poids."]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(screen.getByText("Étape 1 sur 2")).toBeInTheDocument();
  });

  it("étape 2 : un palmarès par discipline cochée, victoires ≤ combats, envoi bloqué sans consentement", async () => {
    const fetchMock = stubApi(club);
    const user = setup();
    await fillIdentity(user);
    await click(user, "Suivant");

    expect(await screen.findByRole("heading", { name: "Ton profil sportif" })).toBeInTheDocument();
    const send = screen.getByRole("button", { name: "Envoyer ma fiche" });
    await click(user, "Boxe anglaise");
    await click(user, "Muay-thaï");
    const boxing = within(screen.getByRole("group", { name: "Palmarès Boxe anglaise" }));
    expect(screen.getByRole("group", { name: "Palmarès Muay-thaï" })).toBeInTheDocument();

    // Plus de victoires que de combats : message d'erreur, rien n'est envoyé.
    await user.clear(boxing.getByLabelText("Combats amateurs"));
    await user.type(boxing.getByLabelText("Combats amateurs"), "3");
    await user.clear(boxing.getByLabelText("Victoires"));
    await user.type(boxing.getByLabelText("Victoires"), "5");
    expect(send).toBeDisabled(); // consentement pas encore donné
    await user.click(screen.getByRole("checkbox", { name: /J'accepte que Boxing Club Belleville/ }));
    expect(send).toBeEnabled();
    await user.click(send);
    expect(await screen.findByText("Les victoires ne peuvent pas dépasser le nombre de combats.")).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(0);

    // Palmarès corrigé : la fiche part et l'écran de confirmation s'affiche.
    await user.clear(boxing.getByLabelText("Victoires"));
    await user.type(boxing.getByLabelText("Victoires"), "2");
    await user.click(send);
    expect(await screen.findByRole("heading", { name: "Merci Yanis, ta fiche est envoyée" })).toBeInTheDocument();

    const post = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(String(post?.[0])).toMatch(/\/invites\/abc$/);
    expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
      firstName: "Yanis",
      lastName: "Mansouri",
      birthDate: "2002-03-14",
      sex: "MALE",
      weightClassesKg: [71, 75],
      heightCm: 178,
      consent: true,
      records: [
        { discipline: "BOXE_ANGLAISE", fights: 3, wins: 2 },
        { discipline: "MUAY_THAI", fights: 0, wins: 0 },
      ],
    });
  });

  it("« Précédent » garde les valeurs saisies à l'étape 1", async () => {
    stubApi(club);
    const user = setup();
    await fillIdentity(user);
    await click(user, "Suivant");
    await click(user, "Précédent");
    expect(await screen.findByLabelText("Prénom")).toHaveValue("Yanis");
    expect(screen.getByRole("button", { name: "✓ −71 kg" })).toHaveAttribute("aria-pressed", "true");
  });

  it("lien déjà utilisé ou expiré : message clair, pas de formulaire", async () => {
    stubApi({ status: 410, body: { error: "invite_used" } });
    setup();
    expect(await screen.findByRole("heading", { name: "Ce lien n'est plus valable" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Prénom")).not.toBeInTheDocument();
  });

  it("lien inconnu : message dédié", async () => {
    stubApi({ status: 404, body: { error: "invite_not_found" } });
    setup();
    expect(await screen.findByRole("heading", { name: "Ce lien n'existe pas" })).toBeInTheDocument();
  });
});
