"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import { createSession, destroySession, prepareSession, setSessionCookie } from "@/lib/session";

const input = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const slugify = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

export async function signUp(form: FormData) {
  const firstName = input(form, "firstName"), lastName = input(form, "lastName");
  const email = input(form, "email").toLowerCase(), password = String(form.get("password") ?? ""), confirmation = String(form.get("confirmPassword") ?? "");
  const storeName = input(form, "storeName");
  if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password !== confirmation || !storeName) redirect("/signup?error=Check+your+details+and+try+again");
  const passwordHash = await bcrypt.hash(password, 12);
  const base = slugify(storeName);
  if (!base) redirect("/signup?error=Enter+a+valid+store+name");
  const database = await connectDb();
  let storeSlug = base;
  try {
    const session = await database.transaction(async (tx) => {
      const user = await tx.orm.public.User.create({ email, passwordHash, firstName, lastName, role: "STORE_OWNER" });
      const existing = await tx.orm.public.Store.where({ slug: base }).first();
      if (existing) storeSlug = `${base}-${user.id.slice(0, 6)}`;
      const store = await tx.orm.public.Store.create({ name: storeName, slug: storeSlug, contactEmail: email });
      await tx.orm.public.StoreMember.create({ storeId: store.id, userId: user.id, role: "STORE_OWNER" });
      const preparedSession = await prepareSession(user.id);
      await tx.orm.public.Session.create({ userId: user.id, tokenHash: preparedSession.tokenHash, expiresAt: preparedSession.expiresAt });
      return preparedSession;
    });
    await setSessionCookie(session);
  } catch (error) {
    if (error instanceof Error && /unique|constraint|duplicate/i.test(error.message)) redirect("/signup?error=That+email+is+already+registered");
    throw error;
  }
  redirect("/dashboard");
}

export async function logIn(form: FormData) {
  const email = input(form, "email").toLowerCase(), password = String(form.get("password") ?? "");
  const database = await connectDb();
  const user = await database.orm.public.User.where({ email }).first();
  const valid = await bcrypt.compare(password, user?.passwordHash ?? "$2b$12$C6UzMDM.H6dfI/f/IKcEe.8pFrcuMZz9M4nZ.Lf03ESvRVYDoQy6");
  if (!user || !valid || !user.isActive) redirect("/login?error=Invalid+email+or+password");
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logOut() {
  await destroySession();
  redirect("/login");
}
