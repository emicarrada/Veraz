import type { PremiumPlanId } from "@/domain/shared/ids";
import type { PremiumPlanStatus } from "@/domain/shared/enums";

export type PremiumPlan = {
  id: PremiumPlanId;
  code: string;
  name: string;
  features: string[];
  status: PremiumPlanStatus;
};
