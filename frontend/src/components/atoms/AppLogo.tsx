interface AppLogoProps {
  /** Taille du texte (par défaut 26 px). */
  className?: string;
}

function AppLogo({ className = "text-[26px]" }: AppLogoProps) {
  return (
    <span className={`font-display font-black tracking-[-0.01em] ${className}`}>
      FightClubs
    </span>
  );
}

export default AppLogo;
