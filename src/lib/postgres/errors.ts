export class PostgresNotConfiguredError extends Error {
  readonly code = "postgres_not_configured" as const;

  constructor(
    message = "Postgres persistence requires DATABASE_URL.",
  ) {
    super(message);
    this.name = "PostgresNotConfiguredError";
  }
}
