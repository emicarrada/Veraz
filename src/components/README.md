# components

Shared UI (design system), layout shells, and marketing surfaces.

## Structure

- `ui/` — primitives and patterns (Button, Input, Modal, …)
- `layout/` — Header, Footer, Sidebar, MobileNav, ThemeProvider, AppShell
- `marketing/landing/` — official landing sections (compose DS only)

Import from barrels when possible:

```ts
import { Button, Card } from "@/components/ui";
import { Header, Footer } from "@/components/layout";
import { LandingPage } from "@/components/marketing/landing";
```

Feature-specific UI belongs in `src/features/<feature>/components`.

Tokens live in `src/styles/tokens.css` and are mapped through Tailwind.
