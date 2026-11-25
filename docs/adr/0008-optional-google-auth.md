# ADR 0008: Acceso opcional

## Estado

Aceptado — 2026-11-24. Ampliado el mismo día: correo y contraseña, y ficha de cuenta.

## Contexto

Veraz se lee sin cuenta. Quien quiera un inicio propio necesita guardar temas y país, y poder cambiarlos. La puerta es un icono de persona. Detrás están el correo y el botón de Google. El primer uso crea la cuenta y el siguiente entra.

Supabase ya está en el proyecto. Las noticias viven en el Postgres de `DATABASE_URL`.

## Decisión

1. **Puerta:** un icono de persona en la pastilla abre `/entrar`. Ahí se entra con correo y contraseña, o con el botón «Continuar con Google». Crear cuenta usa el mismo correo. No hay otro proveedor.
2. **Sesión:** Supabase Auth. El retorno de Google y el del correo confirmado es `/auth/callback`, fuera del prefijo de locale. Esa ruta cambia el código por la cookie. El middleware refresca la sesión sin bloquear las páginas públicas.
3. **Ficha:** después del primer acceso, `/preferencias` pide nombre, apellido, sexo, edad (desde los 16), intereses, país, el correo opcional de avisos y la aceptación de los términos. Sexo y edad no filtran el feed. Temas y países sí: slugs e ISO. Tabla `user_preferences` en Supabase, `user_id` = `auth.users.id`, RLS con `auth.uid()`.
4. **Inicio:** solo el feed sin categoría, y solo si el onboarding está completo, usa esos temas y esos países, en el día de Ciudad de México y en orden de publicación. Las pestañas no usan la preferencia. Sin sesión, el feed sigue por el país detectado. En México ese frente es Chilango, Sopitas y Xataka México, y después el resto del país. El mismo flujo está en inglés en `/en`.
5. **Secreto:** el client id y el secret de Google viven en el panel de Supabase. La service role no sale al navegador. La contraseña tampoco se guarda en el repositorio. La anon key es pública y el botón de Google la lee en su propio módulo: si el servidor se la pasa como prop, Next la borra en el camino al navegador y el botón no se pinta.

## Cómo activar Google

En Google Cloud, el redirect autorizado es `{NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`.

En Supabase, Authentication → Providers → Google, y en la lista de retornos del sitio:

- `http://localhost:3000/auth/callback`
- `https://www.veraz.app/auth/callback`

La migración `20251125000000_user_preferences.sql` crea la tabla solo si existe `auth.users`. En el Postgres de contenido, sin ese esquema, no crea nada.

## Consecuencias

- El visitante anónimo no cambia.
- La primera entrada, por correo o por Google, abre `/preferencias`. Cuando la ficha ya está guardada, la siguiente entrada vuelve al inicio.
- Si Google no está activo en el panel, el botón de Google no completa el retorno. El correo sigue disponible.
- Si Supabase pide confirmar el correo, la persona vuelve por `/auth/callback` y entonces ve la ficha.
