import { expect, test, type Page } from "@playwright/test";

const PASSWORD = "motdepasse1";

// La base E2E est partagée entre les tests : un e-mail unique évite les collisions (409).
const uniqueEmail = (label: string) => `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

const next = (page: Page, name = "Suivant") => page.getByRole("button", { name, exact: true }).click();

async function fillClubStep(page: Page) {
  await page.getByRole("textbox", { name: /nom du club/i }).fill("Fight Club Paris");
  await page.getByRole("textbox", { name: /ville/i }).fill("Paris");
  await page.getByRole("textbox", { name: /code postal/i }).fill("75001");
  await page.getByRole("button", { name: "Boxe anglaise" }).click();
  await page.getByRole("button", { name: "FFB" }).click();
  await next(page);
}

async function fillManagerStep(page: Page, email: string) {
  await expect(page.getByRole("heading", { name: "Responsable du compte" })).toBeVisible();
  await page.getByRole("textbox", { name: "Prénom", exact: true }).fill("Jean");
  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Dupont");
  await page.getByRole("textbox", { name: "Adresse e-mail", exact: true }).fill(email);
  await page.getByLabel(/^mot de passe \(8/i).fill(PASSWORD);
  await page.getByRole("checkbox", { name: /partag/i }).check();
  await next(page);
}

async function acceptTermsAndSubmit(page: Page) {
  await expect(page.getByRole("heading", { name: "Contact pour organiser le combat" })).toBeVisible();
  await page.getByRole("checkbox", { name: /conditions d'utilisation/i }).check();
  await next(page, "Créer le compte du club");
}

test("création d'un compte club : du formulaire à la page « compte créé »", async ({ page }) => {
  const email = uniqueEmail("ok");
  await page.goto("/onboarding");
  await page.getByRole("link", { name: /club/i }).first().click();
  await expect(page).toHaveURL(/\/onboarding\/club$/);

  await fillClubStep(page);
  await fillManagerStep(page, email);
  await acceptTermsAndSubmit(page);

  await expect(page.getByRole("heading", { name: "Le compte de ton club est créé" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Tu es connecté");

  // La session est réellement ouverte : l'API reconnaît le cookie posé à l'inscription.
  const me = await page.evaluate(async () => {
    const res = await fetch("http://localhost:3100/auth/me", { credentials: "include" });
    return { status: res.status, body: await res.json() };
  });
  expect(me.status).toBe(200);
  expect(me.body.email).toBe(email);
});

test("e-mail déjà utilisé : retour à l'étape « Responsable » avec un message", async ({ page, browser }) => {
  const email = uniqueEmail("dup");

  // 1er compte créé avec cet e-mail.
  await page.goto("/onboarding/club");
  await fillClubStep(page);
  await fillManagerStep(page, email);
  await acceptTermsAndSubmit(page);
  await expect(page.getByRole("heading", { name: "Le compte de ton club est créé" })).toBeVisible();

  // 2e tentative avec le même e-mail, dans un contexte vierge.
  const context = await browser.newContext();
  const second = await context.newPage();
  await second.goto("/onboarding/club");
  await fillClubStep(second);
  await fillManagerStep(second, email);
  await acceptTermsAndSubmit(second);

  await expect(second.getByRole("heading", { name: "Responsable du compte" })).toBeVisible();
  await expect(second.getByText("Un compte existe déjà avec cette adresse e-mail.")).toBeVisible();
  await context.close();
});

test("sans consentement au partage des données, « Suivant » n'avance pas", async ({ page }) => {
  await page.goto("/onboarding/club");
  await fillClubStep(page);

  await expect(page.getByRole("heading", { name: "Responsable du compte" })).toBeVisible();
  await page.getByRole("textbox", { name: "Prénom", exact: true }).fill("Jean");
  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Dupont");
  await page.getByRole("textbox", { name: "Adresse e-mail", exact: true }).fill(uniqueEmail("noconsent"));
  await page.getByLabel(/^mot de passe \(8/i).fill(PASSWORD);
  await next(page);

  await expect(page.getByText(/Coche cette case pour continuer/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Responsable du compte" })).toBeVisible();
});
