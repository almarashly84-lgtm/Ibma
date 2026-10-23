export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA: R2Bucket;
  /** Per-visitor limits (counted in memory by Cloudflare, no database writes). */
  RL_VISITOR?: RateLimit;
  /** Site-wide limits per Cloudflare location (protects against many addresses at once). */
  RL_GLOBAL?: RateLimit;
  /** Per-visitor limit for anonymous statistics. */
  RL_STATS?: RateLimit;
  /** Secret set in Cloudflare (Settings → Variables and Secrets). Used only for the very first login. */
  ADMIN_INITIAL_PASSWORD?: string;
}
