/**
 * Textes provisoires des conditions d'utilisation et de la politique de confidentialité.
 * À faire relire et valider par un juriste avant la mise en production ; compléter les [crochets].
 */
import type { ReactNode } from "react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4">
      <h4 className="m-0 mb-1 text-[15px] leading-5 font-bold">{title}</h4>
      <div className="text-[14px] leading-5 text-ink-muted">{children}</div>
    </section>
  );
}

export function TermsText() {
  return (
    <>
      <Section title="1. Objet">
        <p className="m-0">
          FightClubs met en relation des clubs, entraîneurs, combattants et
          organisateurs de galas pour trouver un adversaire. FightClubs est un
          service de mise en relation : nous n'organisons pas les combats.
        </p>
      </Section>
      <Section title="2. Ton compte">
        <p className="m-0">
          Tu t'engages à donner des informations exactes sur ton club et sur
          toi, à garder ton mot de passe secret et à ne gérer que le compte d'un
          club dont tu es responsable.
        </p>
      </Section>
      <Section title="3. Annonces et combats">
        <p className="m-0">
          Tu publies des annonces et proposes des combattants sous ta
          responsabilité. Les clubs restent seuls responsables de la sécurité
          des combats : licences, certificats médicaux, assurance, catégories de
          poids et d'expérience, et respect de la réglementation de leur
          fédération. FightClubs ne garantit ni le niveau ni la fiabilité des
          combattants ou des clubs.
        </p>
      </Section>
      <Section title="4. Comportement attendu">
        <p className="m-0">
          Pas de fausse annonce, de propos injurieux ou discriminatoires, ni
          d'usage des coordonnées d'autres clubs pour autre chose que
          l'organisation d'un combat (pas de démarchage commercial).
        </p>
      </Section>
      <Section title="5. Suspension">
        <p className="m-0">
          FightClubs peut suspendre ou supprimer un compte qui ne respecte pas
          ces conditions. Tu peux supprimer ton compte à tout moment.
        </p>
      </Section>
      <Section title="6. Droit applicable">
        <p className="m-0">
          Ces conditions sont soumises au droit français. Dernière mise à jour :
          11/2026.
        </p>
      </Section>
    </>
  );
}

export function PrivacyText() {
  return (
    <>
      <Section title="1. Qui est responsable de tes données ?">
        <p className="m-0">Orbik hq, joignable à contact@orbik.tech.</p>
      </Section>
      <Section title="2. Quelles données collectons-nous ?">
        <p className="m-0">
          Les informations de ton club (nom, disciplines, ville, code postal,
          fédérations) et les tiennes (prénom, nom, e-mail, téléphone, mot de
          passe chiffré).
        </p>
      </Section>
      <Section title="3. Pourquoi ?">
        <p className="m-0">
          Pour créer et faire fonctionner ton compte, et pour permettre aux
          autres clubs de te contacter afin d'organiser un combat.
        </p>
      </Section>
      <Section title="4. Ce qui est partagé">
        <p className="m-0">
          Ton prénom, ton nom et uniquement les moyens de contact que tu as
          activés (e-mail, téléphone, WhatsApp) sont visibles par les autres
          clubs. Tu peux désactiver un moyen de contact à tout moment, à
          condition d'en garder un actif. Nous ne vendons pas tes données et ne
          les utilisons pas pour de la publicité.
        </p>
      </Section>
      <Section title="5. Base légale et durée">
        <p className="m-0">
          Le partage de tes coordonnées repose sur ton consentement, que tu peux
          retirer en supprimant ton compte. Tes données sont conservées tant que
          ton compte est actif, puis supprimées sous [durée, ex. 12 mois].
        </p>
      </Section>
      <Section title="6. Tes droits">
        <p className="m-0">
          Tu peux demander l'accès, la correction, la suppression ou la
          portabilité de tes données, et retirer ton consentement, en écrivant à
          contact@orbik.tech. Tu peux aussi saisir la CNIL (cnil.fr).
        </p>
      </Section>
      <Section title="7. Hébergement et sécurité">
        <p className="m-0">
          Données hébergées chez [hébergeur, pays]. Dernière mise à jour :
          11/2026.
        </p>
      </Section>
    </>
  );
}
