export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA: R2Bucket;
  /** Secret set in Cloudflare (Settings → Variables and Secrets). Used only for the very first login. */
  ADMIN_INITIAL_PASSWORD?: string;
}
