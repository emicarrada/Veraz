export type {
  ConfigValidationIssue,
  ConfigValidationResult,
  ConfigValidationSeverity,
  ConfigValidator,
} from "@/config/validation/validate-config";

export {
  CONFIG_VALIDATORS,
  createValidationResult,
  runBuiltInValidators,
  validateConfig,
} from "@/config/validation/validate-config";
