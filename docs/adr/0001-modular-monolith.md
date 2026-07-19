# ADR 0001 — Modular monolith en Next.js

## Estado

Aceptado

## Contexto

Veraz necesita escalar en lectores, integrar IA y mantener un dominio claro (news, insights, auth, premium), sin el coste operacional de microservicios desde el día uno.

## Decisión

Construir un **modular monolith** en Next.js (App Router) desplegado en Vercel, con boundaries por feature en `src/features/*`, Supabase como Auth/DB, y enriquecimiento IA opcional vía **AI Engine** (jobs asíncronos cuando esté activo).

## Consecuencias

- Desarrollo más rápido y tipado compartido sencillo
- Extracción futura de workers (ingesta/IA) sin reescribir el dominio
- Requiere disciplina de imports y ownership por feature
