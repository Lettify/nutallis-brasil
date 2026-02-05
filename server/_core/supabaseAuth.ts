import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from "jose";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const getBearerToken = (req: Request) => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

const getString = (value: unknown) => (typeof value === "string" ? value : null);

export async function authenticateRequest(req: Request): Promise<User | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const header = decodeProtectedHeader(token);
    const alg = typeof header.alg === "string" ? header.alg : "";

    if (!ENV.supabaseUrl) {
      console.warn("[Auth] SUPABASE_URL is not configured");
      return null;
    }

    let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];

    if (alg.startsWith("HS")) {
      if (!ENV.supabaseJwtSecret) {
        console.warn("[Auth] SUPABASE_JWT_SECRET is not configured");
        return null;
      }
      const secretKey = new TextEncoder().encode(ENV.supabaseJwtSecret);
      ({ payload } = await jwtVerify(token, secretKey));
    } else {
      const apiKey = ENV.supabaseAnonKey || ENV.supabaseServiceRoleKey;
      if (!apiKey) {
        console.warn("[Auth] SUPABASE_ANON_KEY is not configured");
        return null;
      }
      const jwksUrls = [
        new URL(`${ENV.supabaseUrl}/auth/v1/keys`),
        new URL(`${ENV.supabaseUrl}/auth/v1/.well-known/jwks.json`),
        new URL(`${ENV.supabaseUrl}/.well-known/jwks.json`),
      ];

      let lastError: unknown = null;
      for (const jwksUrl of jwksUrls) {
        try {
          const jwks = createRemoteJWKSet(jwksUrl, {
            headers: {
              apikey: apiKey,
            },
          });
          ({ payload } = await jwtVerify(token, jwks, {
            issuer: `${ENV.supabaseUrl}/auth/v1`,
            audience: "authenticated",
          }));
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (lastError) {
        throw lastError;
      }
    }

    const openId = getString(payload.sub);
    if (!openId) return null;

    const email = getString(payload.email);
    const userMetadata = payload.user_metadata as Record<string, unknown> | undefined;
    const fullName = getString(userMetadata?.full_name) ?? getString(userMetadata?.name);

    await db.upsertUser({
      openId,
      name: fullName,
      email: email ?? null,
      loginMethod: "supabase",
      lastSignedIn: new Date(),
    });

    const user = await db.getUserByOpenId(openId);
    return user ?? null;
  } catch (error) {
    console.warn("[Auth] Supabase token verification failed:", String(error));
    return null;
  }
}
