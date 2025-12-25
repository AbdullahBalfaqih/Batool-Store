
"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isResizing: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const Sidebar = ({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResizing) {
      timer = setTimeout(() => setIsResizing(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isResizing]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, isResizing }}>
      <div
        className={cn(
          "bg-surface-dark border-l border-border-dark hidden md:block transition-all duration-300",
          open ? "w-60" : "w-20"
        )}
        onMouseEnter={() => {
            if (!isResizing) setOpen(true);
        }}
        onMouseLeave={() => {
            if (!isResizing) setOpen(false);
        }}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export const SidebarBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open } = useSidebar();
  return (
    <div className={cn("flex flex-col h-full p-4 overflow-y-auto", className)}>
        {children}
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | null;
}

export const SidebarLink = ({ href, label, icon, badge }: SidebarLinkProps) => {
  const { open } = useSidebar();
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-primary hover:bg-surface-dark/50",
        {
          "bg-primary/10 text-primary": isActive,
        },
        open ? "justify-start" : "justify-center"
      )}
    >
      <div className="shrink-0">{icon}</div>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="whitespace-nowrap overflow-hidden flex-1"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
       {open && badge !== null && badge !== undefined && badge > 0 && (
         <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="ml-auto text-xs w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          {badge}
        </motion.div>
      )}
    </Link>
  );
};
