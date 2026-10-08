import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { Temporal } from "temporal-polyfill";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";

const cookieName = "merchant_session";
const lifetimeSeconds = 60 * 60 * 24 * 14;
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(value);
}
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function prepareSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Temporal.Instant.fromEpochMilliseconds(Date.now() + lifetimeSeconds * 1000);
  const signed = await new SignJWT({ token }).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime(`${lifetimeSeconds}s`).sign(secret());
  return { userId, tokenHash: hashToken(token), expiresAt, signed };
}

export async function setSessionCookie(session: Awaited<ReturnType<typeof prepareSession>>) {
  (await cookies()).set(cookieName, session.signed, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(session.expiresAt.epochMilliseconds) });
}

export async function createSession(userId: string) {
  const database = await connectDb();
  const session = await prepareSession(userId);
  await database.orm.public.Session.create({ userId, tokenHash: session.tokenHash, expiresAt: session.expiresAt });
  await setSessionCookie(session);
}

export async function getCurrentUser() {
  const signed = (await cookies()).get(cookieName)?.value;
  if (!signed) return null;
  try {
    const database = await connectDb();
    const { payload } = await jwtVerify(signed, secret());
    if (typeof payload.sub !== "string" || typeof payload.token !== "string") return null;
    const session = await database.orm.public.Session.where({ tokenHash: hashToken(payload.token) }).first();
    const sessionValid = Boolean(session && session.userId === payload.sub && Temporal.Instant.compare(session.expiresAt, Temporal.Now.instant()) > 0);
    if (!sessionValid || !session) return null;
    const user = await database.orm.public.User.where({ id: payload.sub }).select("id", "email", "firstName", "lastName", "isActive").first();
    return user?.isActive ? { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } : null;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function destroySession() {
  const jar = await cookies();
  const signed = jar.get(cookieName)?.value;
  if (signed) {
    try {
      const database = await connectDb();
      const { payload } = await jwtVerify(signed, secret());
      if (typeof payload.token === "string") await database.orm.public.Session.where({ tokenHash: hashToken(payload.token) }).delete();
    } catch { /* Expired or invalid cookies are simply cleared. */ }
  }
  jar.delete(cookieName);
}

export async function requireStoreMembership(storeId: string) {
  const user = await requireUser();
  const database = await connectDb();
  const membership = await database.orm.public.StoreMember.where({ storeId, userId: user.id }).first();
  if (!membership) throw new Error("Store access denied");
  return { user, membership };
}

export async function requireStoreOwner(storeId: string) {
  const { user, membership } = await requireStoreMembership(storeId);
  if (membership.role !== "STORE_OWNER") throw new Error("Store owner access required");
  return { user, membership };
}

export async function requireStoreAdmin(storeId: string) {
  const { user, membership } = await requireStoreMembership(storeId);
  if (membership.role !== "STORE_OWNER" && membership.role !== "STORE_ADMIN") throw new Error("Store admin access required");
  return { user, membership };
}
