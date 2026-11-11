import type { ComponentProps } from "react";
import AppShell from "../../components/templates/AppShell";
import { useSearch } from "./useSearch";

/** `AppShell` avec le nom du club connecté. */
function ClubShell(props: Omit<ComponentProps<typeof AppShell>, "clubName">) {
  const { fighters } = useSearch();
  return <AppShell clubName={fighters[0]?.club.name} {...props} />;
}

export default ClubShell;
