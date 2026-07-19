# Estándares de código — Veraz

## TypeScript

- `strict: true` siempre.
- **Prohibido** `any`. Usar `unknown` + narrowing, genéricos o tipos de dominio.
- Preferir tipos explícitos en exports públicos de features, design system y AI Engine.
- Evitar non-null assertions (`!`) salvo justificación documentada.

## Arquitectura

- Modular: lógica en `src/features/<feature>`.
- Dominio puro en `src/domain` (tipos/entidades); **sin** imports de infra/UI.
- `src/app` solo routing, layouts y composition.
- Separar presentación (components) de lógica (services/hooks).
- Componentes pequeños y reutilizables.
- No duplicar código: extraer a `components/`, `utils/` o shared service.
- SOLID: una responsabilidad clara por módulo/función exportada.
- No modificar funcionalidad existente sin necesidad (evitar refactors oportunistas).
- Cambios al modelo → actualizar `docs/domain.md` (+ database/api si afecta mapeo).

## AI Engine (obligatorio)

- **Única** puerta a modelos de IA: `@/lib/ai-engine`.
- **Prohibido** importar `src/lib/ai-engine/providers/**` desde `app/`, `features/` u otro `lib/` ajeno al Engine.
- **Prohibido** acoplar SDKs (OpenAI, Gemini, Anthropic, …) fuera de `providers/<id>/`.
- Default: IA **desactivada**. El producto debe correr sin API keys de IA.
- Publicar una noticia **nunca** debe depender del éxito de un provider.
- Tratar `AIResult` con `ok: false` como degradación, no como crash.
- Cambiar de provider solo vía configuración (`AIEngineConfig`), no tocando features.
- Ver `docs/ai-engine.md` y ADR 0003.

```ts
// ✅
import { getAIEngineConfig, isAIEnabled } from "@/lib/ai-engine";

// ❌
import { something } from "@/lib/ai-engine/providers/openai";
import OpenAI from "openai";
```

## Design System

- Tokens viven en `src/styles/tokens.css`. Tailwind solo mapea; no inventar colores sueltos.
- Tipografía vía `.text-*` / `<Text variant="…" />` — no mezclar tamaños ad hoc.
- Primitivos en `src/components/ui`; shells en `src/components/layout`.
- Variantes por props tipadas (`variant`, `size`), no por CSS duplicado.
- Composición sobre herencia (slots: `nav`, `actions`, `children`, `footer`).
- Client Components solo cuando haya estado, portales o listeners (`Modal`, `Drawer`, `Tabs`, …).
- Accesibilidad: todo control interactivo operable por teclado; icon-only requiere `aria-label`.
- No meter lógica de negocio, rutas de producto ni datos de API en el design system.

```ts
// ✅
<Button variant="secondary" size="sm">Filtrar</Button>

// ❌ hex / spacing mágicos
<button className="bg-[#0d6e7a] px-[13px]">Filtrar</button>
```

## React / Next.js

- Server Components por defecto; Client Components solo cuando haga falta estado/efectos/browser APIs.
- Lógica de negocio fuera de JSX.
- Hooks compartidos en `src/hooks`; hooks de feature en su carpeta.
- Estado global (`src/store`) como último recurso.
- Utilidad `cn` en `@/utils/cn` para componer clases.

## Imports

Usar aliases:

```ts
import { Button } from "@/components/ui";
import { Header } from "@/components/layout";
import type { Article } from "@/domain";
import { getAIEngineConfig } from "@/lib/ai-engine";
import { /* public API */ } from "@/features/news";
```

No deep-importar internals de otro feature (`@/features/news/services/...` desde fuera).

## Documentación

- Al agregar una funcionalidad relevante, actualizar `docs/` (y ADR si cambia una decisión).
- Cambios de tokens / UI → `docs/architecture.md` (Design System).
- Cambios de IA / providers / modos → `docs/ai-engine.md` + `docs/architecture.md`.
- Explicar cambios no obvios con comentarios breves o docs — no ruido en cada línea.
- Mantener el public API de cada feature documentado en su `index.ts`.

## Testing (cuando se active)

- Unit: domain/services puros
- Integration: repos / Route Handlers
- E2E: flujos críticos de lectura y auth
- A11y: componentes interactivos del design system
- AI: Engine con provider fake / disabled; publish path sin red de IA

## Checklist de PR

- [ ] Sin `any`
- [ ] Boundaries de features respetados
- [ ] Sin lógica nueva en `app/` que deba vivir en un feature
- [ ] Sin imports directos a providers / SDKs de IA fuera del Engine
- [ ] Publish / lectura no dependen de IA
- [ ] UI nueva usa tokens / primitivos existentes cuando aplique
- [ ] Docs actualizados si el cambio es visible en arquitectura/API/datos/design system/AI
- [ ] No se rompió comportamiento existente sin justificación
