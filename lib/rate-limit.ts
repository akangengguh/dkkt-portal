import { createHash } from "node:crypto";

type Bucket = { count: number; expiresAt: number };
type RateLimitResult = { allowed: boolean; retryAfter: number; unavailable?: boolean };

declare global {
  var __dkktRateLimitBuckets: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__dkktRateLimitBuckets ?? new Map<string, Bucket>();
globalThis.__dkktRateLimitBuckets = buckets;

const redisScript = "local count=redis.call('INCR',KEYS[1]); if count==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return {count,redis.call('TTL',KEYS[1])}";

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function clientAddress(request: Request) {
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return cloudflareIp || realIp || forwarded || "unknown";
}

export async function rateLimitRequest(
  scope: string,
  subject: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `dkkt:ratelimit:${scope}:${hash(subject)}`;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (redisUrl && redisToken) {
    try {
      const response = await fetch(redisUrl.replace(/\/$/, ""), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["EVAL", redisScript, "1", key, String(windowSeconds)]),
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) throw new Error("Redis rate limiter request failed.");
      const payload = await response.json() as { result?: [number, number]; error?: string };
      if (payload.error || !Array.isArray(payload.result)) throw new Error("Redis rate limiter response is invalid.");
      const [count, ttl] = payload.result;
      return { allowed: count <= limit, retryAfter: Math.max(1, ttl) };
    } catch (error) {
      console.error("RATE_LIMIT_STORE_ERROR:", error);
      return { allowed: false, retryAfter: windowSeconds, unavailable: true };
    }
  }

  if (process.env.NODE_ENV === "production") {
    return { allowed: false, retryAfter: windowSeconds, unavailable: true };
  }

  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.expiresAt <= now) buckets.delete(bucketKey);
    }
  }
  const current = buckets.get(key);
  const bucket = !current || current.expiresAt <= now
    ? { count: 0, expiresAt: now + windowSeconds * 1000 }
    : current;
  bucket.count += 1;
  buckets.set(key, bucket);
  return {
    allowed: bucket.count <= limit,
    retryAfter: Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000)),
  };
}