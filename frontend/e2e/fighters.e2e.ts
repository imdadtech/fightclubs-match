import { expect, test, type Page } from "@playwright/test";

const API = "http://localhost:3100";
const uniqueEmail = () => `e2e-fighters-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

/** Crée un club par l'API : le cookie de session est posé sur le contexte du navigateur. */
async function signUpClub(page: Page, clubName: string) {
  const res = await page.request.post(`${API}/auth/signup/club`, {
    data: {
      club: { name: clubName, city: "Paris", postalCode: "75011", disciplines: ["BOXE_ANGLAISE"], federations: ["FFB"] },
      manager: {
        firstName: "Jean",
        lastName: "Dupont",
        email: uniqueEmail(),
        password: "motdepasse1",
        phoneHasWhatsapp: false,
        contacts: { email: true, phone: false },
        sharingConsent: true,
        acceptedTerms: true,
      },
    },
  });
  expect(res.status()).toBe(201);
}

const next = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).locator("visible=true").first().click();

async function fillIdentity(page: Page, first: string, last: string, weight: string) {
  await page.getByLabel("Prénom").fill(first);
  await page.getByLabel("Nom", { exact: true }).fill(last);
  await page.getByLabel("Date de naissance").fill("1999-09-02");
  await page.getByRole("button", { name: weight }).click();
  await page.getByLabel("Taille (cm)").fill("183");
}

async function fillProfile(page: Page) {
  await page.getByRole("button", { name: "Boxe anglaise" }).click();
  await page.getByRole("button", { name: "Muay-thaï" }).click();
  const group = (name: string) => page.getByRole("group", { name: `Palmarès ${name}` });
  await group("Boxe anglaise").getByLabel("Combats amateurs").fill("7");
  await group("Boxe anglaise").getByLabel("Victoires").fill("5");
  await group("Muay-thaï").getByLabel("Combats amateurs").fill("3");
  await group("Muay-thaï").getByLabel("Victoires").fill("2");
}

test("le club ajoute un combattant, puis un combattant remplit sa fiche via un lien à usage unique", async ({ page, browser }) => {
  await signUpClub(page, "Boxing Club E2E");
  await page.goto("/profil");
  await expect(page.getByRole("heading", { name: "Mes combattants" })).toBeVisible();
  await expect(page.getByText("Ton ring est vide")).toBeVisible();

  // 1. Le club saisit la fiche.
  await page.getByRole("link", { name: "Ajouter un combattant" }).locator("visible=true").first().click();
  await expect(page).toHaveURL(/\/profil\/combattants\/nouveau$/);
  await next(page, "Suivant");
  await expect(page.getByText("Indique le prénom.")).toBeVisible(); // validation de l'étape 1
  await fillIdentity(page, "Rayan", "Kaci", "−81 kg");
  await next(page, "Suivant");
  await fillProfile(page);
  await next(page, "Ajouter le combattant");

  await expect(page).toHaveURL(/\/profil$/);
  await expect(page.getByText("Rayan K.")).toBeVisible();
  await expect(page.getByText(/−81 kg · \d+ ans · 10 combats/).first()).toBeVisible();
  await expect(page.getByText("Non disponible").locator("visible=true").first()).toBeVisible();

  // 2. Le club génère un lien pour son combattant.
  await page.getByRole("button", { name: "Ou envoie un lien au combattant" }).click();
  const link = await page.getByRole("textbox", { name: "Lien à envoyer" }).inputValue();
  expect(link).toMatch(/\/combattant\/[\w-]+$/);
  await page.getByRole("button", { name: "Fermer" }).click();

  // 3. Le combattant (sans compte, autre navigateur) remplit sa fiche.
  const fighterPage = await (await browser.newContext()).newPage();
  await fighterPage.goto(new URL(link).pathname);
  await expect(fighterPage.getByText(/te demande de compléter ta fiche/)).toContainText("Boxing Club E2E");
  await fillIdentity(fighterPage, "Yanis", "Mansouri", "−71 kg");
  await next(fighterPage, "Suivant");
  await fillProfile(fighterPage);
  await expect(fighterPage.getByRole("button", { name: "Envoyer ma fiche" })).toBeDisabled(); // consentement requis
  await fighterPage.getByRole("checkbox").check();
  await next(fighterPage, "Envoyer ma fiche");
  await expect(fighterPage.getByRole("heading", { name: "Merci Yanis, ta fiche est envoyée" })).toBeVisible();

  // 4. Le lien ne marche qu'une fois.
  await fighterPage.reload();
  await expect(fighterPage.getByRole("heading", { name: "Ce lien n'est plus valable" })).toBeVisible();

  // 5. La fiche arrive dans la liste du club.
  await page.reload();
  await expect(page.getByText("Yanis M.")).toBeVisible();
  await expect(page.getByText("Rayan K.")).toBeVisible();
});
