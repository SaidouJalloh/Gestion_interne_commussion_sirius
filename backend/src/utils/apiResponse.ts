export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// JSON.stringify() ne supporte pas les BigInt (erreur: "Do not know how to serialize a BigInt").
// Prisma peut remonter des champs BigInt (ex: taille) en `bigint` JS : on normalise donc toutes
// les réponses API pour être sérialisables en JSON.
const sanitizeForJson = <T>(value: T, seen = new WeakSet<object>()): any => {
  if (typeof value === 'bigint') return value.toString();
  if (value === null || typeof value === 'undefined') return value;

  // Primitives et objets "spéciaux" qui gèrent déjà bien la sérialisation
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return value;
  if (value instanceof Date) return value;

  // Arrays
  if (Array.isArray(value)) return value.map((v) => sanitizeForJson(v, seen));

  // Objects
  if (t === 'object') {
    const obj = value as unknown as object;
    if (seen.has(obj)) return null; // évite les références circulaires
    seen.add(obj);

    // Respecter un éventuel toJSON custom (ex: certains types Prisma/Buffer)
    const maybeToJSON = (value as any).toJSON;
    if (typeof maybeToJSON === 'function') {
      try {
        return sanitizeForJson(maybeToJSON.call(value), seen);
      } catch {
        // fallback vers parcours des propriétés
      }
    }

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as any)) {
      out[k] = sanitizeForJson(v, seen);
    }
    return out;
  }

  return value as any;
};

export const apiResponse = {
  success<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
    return {
      success: true,
      data: sanitizeForJson(data),
      meta: typeof meta === 'undefined' ? undefined : sanitizeForJson(meta),
    } as ApiSuccessResponse<T>;
  },
  error(
    message: string,
    code?: string,
    details?: unknown,
  ): ApiErrorResponse {
    return {
      success: false,
      message,
      code,
      details: typeof details === 'undefined' ? undefined : sanitizeForJson(details),
    };
  },
};


