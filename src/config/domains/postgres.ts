/**
 * Direct PostgreSQL connectivity — declarative flags only (no pool here).
 */
export type PostgresConfig = {
  connectionString: string;
  persistenceEnabled: boolean;
};

export const DEFAULT_POSTGRES_CONFIG: PostgresConfig = {
  connectionString: "",
  persistenceEnabled: false,
};
