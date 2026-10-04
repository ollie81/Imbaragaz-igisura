import { defaultLocale } from "@/i18n/config";

// Fallback for requests that never reach a locale segment. Most visitors are
// redirected to /rw or /en by the proxy and see [locale]/not-found.tsx instead.
export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale}>
      <body className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">404</h1>
          <p className="mt-2">
            <a href={`/${defaultLocale}`} className="text-primary underline">
              Imbaraga z&apos;Igisura
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
