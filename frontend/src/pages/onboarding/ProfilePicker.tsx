import { Link } from "react-router-dom";
import { OnboardingMainImage } from "../../assets";
import { ClubIcon } from "../../assets/onboarding/ClubIcon";
import { EventCreatorIcon } from "../../assets/onboarding/EventCreatorIcon";
import AppLogo from "../../components/atoms/AppLogo";
import type { ProfileCardProps } from "../../components/molecules/cards/ProfileCard";
import ProfileCard from "../../components/molecules/cards/ProfileCard";

const profiles: ProfileCardProps[] = [
  {
    href: "/onboarding/club",
    icon: <ClubIcon />,
    title: "Un club",
    description: "Trouve un adversaire pour tes combattants : publie une annonce, les autres clubs te proposent un combat.",
  },
  {
    href: "/onboarding/individual",
    icon: <EventCreatorIcon />,
    title: "Un promoteur",
    description: "Compose une carte, trouve des combattants.",
  },
];

function ProfilePicker() {
  return (
    <div className="min-h-dvh bg-canvas text-ink md:flex">
      <div className="hidden md:block md:w-2/5 md:flex-none lg:w-1/2">
        <img
          className="sticky top-0 h-dvh w-full object-cover"
          src={OnboardingMainImage}
          alt="Photo de boxe de Ivana Cajinasur trouvé sur Unsplash"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6 md:p-10 md:pt-8 lg:px-16">
        <AppLogo />
        <div className="flex flex-1 flex-col justify-center py-8 md:py-10">
          <h1 className="m-0 mb-2 font-display text-[clamp(34px,9vw,56px)] leading-[1.05] font-black tracking-[-0.02em] text-balance">
            Tu es qui sur le ring ?
          </h1>
          <p className="m-0 mb-5 max-w-110 text-[16px] leading-6 sm:text-[18px] sm:leading-7 text-ink-muted">
            Choisis ton profil. Tu pourras ajouter les autres plus tard.
          </p>

          {profiles.map((profile) => (
            <div key={profile.href} className="mb-4 last:mb-0 sm:mb-5">
              <ProfileCard {...profile} />
            </div>
          ))}

          <div className="mt-4 text-[15px] text-ink-muted">
            Tu as déjà un compte ?{" "}
            <Link to="/login" className="font-bold underline text-red-deep">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePicker;
