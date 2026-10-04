"use client";

import { useEffect, useId, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { ChatIcon, CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type MobileMenuProps = {
  items: { href: string; label: string }[];
  labels: { open: string; close: string; menu: string; whatsapp: string; call: string };
  whatsappHref: string | null;
  callHref: string | null;
  className?: string;
};

/** Hamburger menu for small screens. Closes on link click, Escape and navigation. */
export function MobileMenu({ items, labels, whatsappHref, callHref, className }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close when the route changes (adjusting state during render, per React docs).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className={className}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-full border border-border bg-background text-leaf-900 transition-colors hover:bg-muted"
      >
        {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lift"
      >
        <nav aria-label={labels.menu} className="mx-auto w-full max-w-6xl px-4 pt-2 pb-5 sm:px-6">
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-13 items-center text-lg font-semibold text-leaf-900 hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "accent", size: "lg" })}
              >
                <ChatIcon />
                {labels.whatsapp}
              </a>
            )}
            {callHref && (
              <a
                href={callHref}
                className={cn(
                  buttonStyles({ variant: "primary", size: "lg" }),
                  !whatsappHref && "col-span-2",
                )}
              >
                <PhoneIcon />
                {labels.call}
              </a>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
