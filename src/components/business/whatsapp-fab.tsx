import { ChatIcon } from "@/components/ui/icons";

type WhatsAppFabProps = { href: string; label: string; ariaLabel: string };

/**
 * Floating WhatsApp button for phones. Hidden from tablet width up, where the
 * header button is visible. The footer reserves space so it never covers content.
 */
export function WhatsAppFab({ href, label, ariaLabel }: WhatsAppFabProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-flex min-h-13 items-center gap-2 rounded-full bg-leaf-700 py-3 pr-5 pl-4 font-semibold text-white shadow-lift ring-4 ring-white/70 transition-colors hover:bg-leaf-800 md:hidden"
    >
      <ChatIcon className="size-6" />
      {label}
    </a>
  );
}
