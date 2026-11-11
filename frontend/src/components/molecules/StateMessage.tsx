/** Message d'état (chargement, vide, erreur), dit à l'utilisateur quoi faire. */
function StateMessage({ children, alert }: { children: string; alert?: boolean }) {
  return (
    <p role={alert ? "alert" : "status"} className="m-0 text-[15px] leading-5.5 text-ink-muted">
      {children}
    </p>
  );
}

export default StateMessage;
