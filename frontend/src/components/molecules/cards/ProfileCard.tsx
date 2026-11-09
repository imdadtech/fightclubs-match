import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { RightArrowIcon } from "../../../assets/RightArrowIcon";

export interface ProfileCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}

function ProfileCard({ href, icon, title, description }: ProfileCardProps) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 rounded-3xl border-2 border-ink bg-surface-raised p-4 text-ink no-underline shadow-[4px_4px_0_0_var(--color-ink)] sm:gap-5 sm:p-6 sm:shadow-[6px_6px_0_0_var(--color-ink)]"
    >
      <span className="grid size-12 flex-none sm:size-16 place-items-center rounded-[18px] bg-red-tint text-red-deep">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[20px] leading-6 font-extrabold sm:text-[24px] sm:leading-7">
          {title}
        </span>
        <span className="mt-1 block text-[14px] leading-5 sm:text-[16px] sm:leading-6 text-ink-muted">
          {description}
        </span>
      </span>
      <span className="flex-none"><RightArrowIcon /></span>
    </Link>
  );
}

export default ProfileCard;
