# Visión de producto — Veraz

## Propósito

Veraz informa sin influenciar. Es una **plataforma de noticias** que agrega fuentes verificables y presenta información clara y trazable.

La **inteligencia artificial es opcional**: cuando está habilitada, enriquece el contenido (resúmenes objetivos, contexto, indicadores). Cuando está deshabilitada o falla, la plataforma sigue informando con normalidad.

Veraz **no crea noticias** ni inventa hechos. Todo el contenido debe basarse en fuentes reales y citables.

## Principios de producto

1. **Núcleo = noticias** — Publicar y leer no dependen de IA.
2. **IA como enriquecimiento** — Nunca es un punto único de fallo.
3. **Trazabilidad** — Todo insight (si existe) debe vincularse a fuentes.
4. **Neutralidad operativa** — La IA contextualiza; no editorializa ni “toma partido”.
5. **Transparencia** — Indicadores de confiabilidad y posible sesgo visibles cuando hay enrichment.
6. **No republicación completa** — Preferir excerpt, enlace y atribución.
7. **Lectura primero** — La experiencia de lectura no depende de llamadas síncronas a IA.

## Objetivos técnicos

- Plataforma moderna, rápida y responsive
- Diseño minimalista y accesible
- SEO optimizado
- Arquitectura modular y escalable
- Agnóstica al proveedor de IA (AI Engine)
- Operable sin API keys de IA
- Preparada para alto volumen de lectores (CDN + ISR/cache)

## Fuera de alcance (por ahora)

- Generación de noticias sintéticas presentadas como hechos
- Dependencia obligatoria de un vendor de IA
- Microservicios prematuros
- Motor de búsqueda dedicado (previsto en fases posteriores)
