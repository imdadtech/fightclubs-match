import AppLogo from "../../../components/atoms/AppLogo";
import { buttonClasses } from "../../../components/atoms/Buttons";

function ClubAccountCreated() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-4 py-5 text-ink min-[900px]:px-12 min-[900px]:py-10">
      <AppLogo className="text-[22px] min-[900px]:text-[26px]" />
      <main className="flex flex-1 flex-col justify-center gap-3 py-10 min-[900px]:max-w-120">
        <h1 className="m-0 font-display text-[34px] leading-[1.05] font-black min-[900px]:text-[48px] min-[900px]:tracking-[-0.02em]">
          Le compte de ton club est créé
        </h1>
        <p role="status" className="m-0 text-[16px] leading-6 text-ink-muted min-[900px]:text-[18px] min-[900px]:leading-7">
          Tu es connecté. Les autres clubs pourront bientôt te contacter pour organiser un combat.
        </p>
        {/* Lien classique (rechargement) : la session créée à l'inscription est relue par l'app. */}
        <a href="/adversaires" className={`${buttonClasses({ size: "lg" })} mt-4 self-start px-8`}>
          Trouver un adversaire
        </a>
      </main>
    </div>
  );
}

export default ClubAccountCreated;
