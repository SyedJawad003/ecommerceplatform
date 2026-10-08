"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import { requireStoreAdmin, requireUser } from "@/lib/session";

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function updateStoreSettings(form: FormData) {
  const user = await requireUser();
  const database = await connectDb();
  const membership = await database.orm.public.StoreMember.where({ userId: user.id }).first();
  if (!membership) redirect("/login");
  await requireStoreAdmin(membership.storeId);
  const name = value(form, "name");
  if (!name) redirect("/dashboard/settings?error=Store+name+is+required");
  const currency = value(form, "currency").toUpperCase() || "USD";
  if (!/^[A-Z]{3}$/.test(currency)) redirect("/dashboard/settings?error=Enter+a+valid+three+letter+currency+code");
  const timezone = value(form, "timezone") || "UTC";
  try { new Intl.DateTimeFormat("en", { timeZone: timezone }); } catch { redirect("/dashboard/settings?error=Enter+a+valid+timezone"); }
  await database.orm.public.Store.where({ id: membership.storeId }).update({
    name,
    description: value(form, "description") || null,
    contactEmail: value(form, "contactEmail") || null,
    contactPhone: value(form, "contactPhone") || null,
    currency,
    timezone,
    address: value(form, "address") || null,
    city: value(form, "city") || null,
    state: value(form, "state") || null,
    country: value(form, "country") || null,
    postalCode: value(form, "postalCode") || null,
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?saved=1");
}
