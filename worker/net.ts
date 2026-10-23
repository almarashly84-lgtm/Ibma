// Network helpers without dependencies (also used by tests).

/**
 * The visitor's network for rate limits: the full address for IPv4, the /64 network for IPv6
 * (one home or phone connection receives a whole /64, so changing the last part must not bypass limits).
 */
export function clientNetwork(request: Request) {
  const ip = (request.headers.get('CF-Connecting-IP') || 'unknown').trim().toLowerCase();
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.split('::');
  const left = head ? head.split(':') : [];
  const right = ip.includes('::') && tail ? tail.split(':') : [];
  const groups = ip.includes('::') ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right] : left;
  return groups.slice(0, 4).map((g) => (g || '0').replace(/^0+(?=.)/, '')).join(':') + '::/64';
}
