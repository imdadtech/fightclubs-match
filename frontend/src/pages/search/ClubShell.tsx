import type { ComponentProps } from "react";
import AppShell from "../../components/templates/AppShell";
import { useAuth } from "../auth/useAuth";
import { useSearch } from "./useSearch";

/** `AppShell` avec le nom du club connecté. */
function ClubShell(props: Omit<ComponentProps<typeof AppShell>, "clubName">) {
  const { fighters } = useSearch();
  const { auth } = useAuth();
  const sessionClub = auth.status === "signed-in" ? auth.user.club?.name : undefined;
  return <AppShell clubName={sessionClub ?? fighters[0]?.club.name} {...props} />;
}

export default ClubShell;
