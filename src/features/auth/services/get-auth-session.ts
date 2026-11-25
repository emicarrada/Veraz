import { createAuthServerClient } from "@/lib/supabase/auth-server";

export type AuthSession = {
  userId: string;
  email: string | null;
  displayName: string | null;
};

function displayNameFromMetadata(metadata: Record<string, unknown> | undefined): string | null {
  const first = metadata?.first_name;
  const last = metadata?.last_name;
  if (typeof first === "string" && first.trim()) {
    const lastName = typeof last === "string" ? last.trim() : "";
    return [first.trim(), lastName].filter(Boolean).join(" ");
  }
  const fullName = metadata?.full_name;
  const name = metadata?.name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  if (typeof name === "string" && name.trim()) return name.trim();
  return null;
}

/** Signed-in reader, or null when there is no session. Never throws into the public pages. */
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const supabase = await createAuthServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      displayName: displayNameFromMetadata(data.user.user_metadata),
    };
  } catch {
    return null;
  }
}
