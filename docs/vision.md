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

## Ritmo del feed

El feed se lee en tres planos y no reescribe el titular guardado. En Finanzas y Tecnología, si el medio publicó en inglés, la versión en español muestra titular y extracto traducidos, con la fuente y el enlace original. Si la traducción no llega, queda el texto del medio.

- La primera pieza se muestra más grande. Las siguientes alternan tarjeta con imagen y titular corto, con la hora en relativo.
- Si varios medios publican titulares muy parecidos dentro de una ventana corta, se agrupan en una pieza y cada fuente sigue visible con su propio titular. El parecido es léxico: no afirma que sea el mismo hecho.
- El navegador recuerda lo leído y la última visita. Eso marca lo no leído y avisa si hay novedades. No reordena el feed.
- El feed público muestra solo lo publicado en el día en curso. El día se mide en hora de la Ciudad de México.
- En Todas, el país del visitante va primero. Dentro de ese país, la cultura con foto del medio abre, luego el resto de las fotos de ese país, y después las notas sin foto usable. El mundo va al final, también con foto primero. En México, sin sesión, el frente lo ocupan Chilango, Sopitas y Xataka México; después sigue el resto del país. Con sesión y la ficha completa, el inicio usa los temas y países elegidos al registrarse, no ese frente. La foto tiene que medir al menos 800 px en el lado largo y 400 px en el corto; una miniatura no se usa. El país sale de la cabecera del hosting o del idioma del navegador; si no hay señal, se asume México. Las demás pestañas ponen primero las notas con foto propia y, dentro de eso, el orden de publicación.

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
