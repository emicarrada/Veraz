import type { MediaId, UserId } from "@/domain/shared/ids";
import type { UserStatus } from "@/domain/shared/enums";
import type { Instant } from "@/domain/shared/value-objects";

/**
 * Domain projection of a person. Auth credentials live in infrastructure (e.g. Supabase Auth).
 */
export type UserProfile = {
  id: UserId;
  displayName?: string;
  avatarMediaId?: MediaId;
  status: UserStatus;
  createdAt: Instant;
};
