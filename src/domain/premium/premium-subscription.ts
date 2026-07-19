import type {
  PremiumPlanId,
  PremiumSubscriptionId,
  UserId,
} from "@/domain/shared/ids";
import type { SubscriptionStatus } from "@/domain/shared/enums";
import type { Instant } from "@/domain/shared/value-objects";

export type PremiumSubscription = {
  id: PremiumSubscriptionId;
  userId: UserId;
  planId: PremiumPlanId;
  status: SubscriptionStatus;
  currentPeriodStart: Instant;
  currentPeriodEnd: Instant;
  cancelAtPeriodEnd: boolean;
};
