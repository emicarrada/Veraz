# Veraz

Informar sin influenciar.

Veraz es una plataforma de noticias que agrega fuentes verificables y presenta información clara y trazable. La IA es **opcional**: puede enriquecer el contenido (resúmenes, contexto), pero la plataforma funciona sin ningún proveedor de inteligencia artificial.

## Stack

- Next.js (App Router) · React · TypeScript · Tailwind CSS
- Supabase (Auth + PostgreSQL)
- AI Engine (opcional, multi-provider — sin vendor fijo)
- Vercel

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/vision.md](docs/vision.md) | Visión y principios de producto |
| [docs/domain.md](docs/domain.md) | Modelo de dominio y entidades |
| [docs/architecture.md](docs/architecture.md) | Arquitectura y boundaries |
| [docs/ai-engine.md](docs/ai-engine.md) | AI Engine, modos y Provider Pattern |
| [docs/roadmap.md](docs/roadmap.md) | Fases de desarrollo |
| [docs/database.md](docs/database.md) | Modelo de datos (planificado) |
| [docs/api.md](docs/api.md) | Contratos de API (planificado) |
| [docs/coding-standards.md](docs/coding-standards.md) | Estándares de código |

## Desarrollo local

```bash
npm install
npm run dev
```

Requisitos: Node.js 20+. **No se necesita ninguna API key de IA.**

## Estado actual

Base de proyecto + Design System + contratos del AI Engine. Sin lógica de negocio ni integraciones de proveedores aún.
