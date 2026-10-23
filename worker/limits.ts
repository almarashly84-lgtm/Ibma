// First line of defence against floods: Cloudflare's rate-limiting bindings work in memory and cost
// no database reads or writes, so fake traffic is stopped before it can use up the daily D1 quota.
import type { Env } from './env';
import { clientNetwork } from './net';

type Binding = 'RL_VISITOR' | 'RL_GLOBAL' | 'RL_STATS';

async function allowed(env: Env, binding: Binding, key: string) {
  const limiter = env[binding];
  if (!limiter) return true; // binding missing (e.g. old configuration): rely on the database limits
  try {
    const { success } = await limiter.limit({ key });
    return success;
  } catch {
    return true; // never block real visitors because the limiter itself failed
  }
}

/** Per visitor network (IPv4 address or IPv6 /64) and per action, e.g. 'booking'. */
export const visitorAllowed = (env: Env, request: Request, action: string) =>
  allowed(env, 'RL_VISITOR', `${action}:${clientNetwork(request)}`);

/** Site-wide per action, per Cloudflare location. */
export const globalAllowed = (env: Env, action: string) => allowed(env, 'RL_GLOBAL', action);

/** Statistics: per visitor network. */
export const statsAllowed = (env: Env, request: Request) => allowed(env, 'RL_STATS', clientNetwork(request));
