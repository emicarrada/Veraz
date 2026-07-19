import { Footer } from "@/components/layout/footer";

const FOOTER_LINKS = [
  { href: "#que-es-veraz", label: "[PLACEHOLDER: enlace 1]" },
  { href: "#como-funciona", label: "[PLACEHOLDER: enlace 2]" },
  { href: "#caracteristicas", label: "[PLACEHOLDER: enlace 3]" },
  { href: "#cta-final", label: "[PLACEHOLDER: enlace 4]" },
] as const;

const LEGAL_LINKS = [
  { href: "#placeholder-privacy", label: "[PLACEHOLDER: privacidad]" },
  { href: "#placeholder-terms", label: "[PLACEHOLDER: términos]" },
] as const;

export function LandingFooter() {
  return (
    <Footer
      nav={
        <>
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-small text-ink-secondary veraz-transition hover:text-ink veraz-focus-ring rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </>
      }
      legal={
        <>
          {LEGAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-ink-muted veraz-transition hover:text-ink veraz-focus-ring rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </>
      }
    />
  );
}
