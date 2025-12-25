'use client';
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps } from "react";

export const NavbarContainer = ({
  children,
  className,
  ...props
}: ComponentProps<"nav">) => {
  return (
    <nav
      className={cn(
        "flex w-full max-w-5xl items-center justify-between backdrop-blur-md bg-neutral-800/50 rounded-2xl shadow-xl shadow-black/5 p-px relative border border-neutral-400/10",
        className,
      )}
      {...props}
    >
      <div className="gap-x-0 sm:gap-x-2 flex w-full items-center justify-between p-1 sm:p-2">
        {children}
      </div>
    </nav>
  );
};

export const NavbarLink = ({
  children,
  href,
  isHighlighted,
  className,
  ...props
}: {
  isHighlighted?: boolean;
} & ComponentProps<"a">) => {
  return (
    <li>
      <Link
        href={href ?? '#'}
        className={cn(
          "relative inline-flex text-sm h-11 items-center justify-center font-bold",
          isHighlighted
            ? "text-white bg-gradient-to-b from-primary to-blue-700 rounded-[14px] hover:from-primary/80 hover:to-blue-700/80 shadow-md transition-all hover:scale-105 px-4 sm:px-6 min-w-0"
            : "text-neutral-300 before:absolute before:inset-0  before:bg-neutral-500/20 hover:before:scale-100 before:scale-50 before:opacity-0 hover:before:opacity-100 before:transition before:rounded-[14px] min-w-16 sm:min-w-28",
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </Link>
    </li>
  );
};
