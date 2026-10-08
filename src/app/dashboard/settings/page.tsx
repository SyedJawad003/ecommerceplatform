import { requireUser, requireStoreAdmin } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { updateStoreSettings } from "@/lib/store-actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const user = await requireUser();
  const database = await connectDb();
  const membership = await database.orm.public.StoreMember.where({ userId: user.id }).first();
  if (!membership) return <p>No store is linked to your account.</p>;
  await requireStoreAdmin(membership.storeId);
  const store = await database.orm.public.Store.where({ id: membership.storeId }).first();
  if (!store) return <p>Store not found.</p>;
  const fields = [["name", "Store name"], ["description", "Description"], ["contactEmail", "Contact email", "email"], ["contactPhone", "Contact phone", "tel"], ["currency", "Currency"], ["timezone", "Timezone"], ["address", "Street address"], ["city", "City"], ["state", "State / province"], ["country", "Country"], ["postalCode", "Postal code"]] as const;
  return <><div className="dash-heading settings-heading"><div><p className="eyebrow">YOUR STORE, YOUR WAY</p><h1>Store settings</h1><p>Keep your business details up to date.</p></div></div>{saved && <p className="success-message" role="status">Your store settings have been saved.</p>}{error && <p role="alert" className="form-error">{error}</p>}<form action={updateStoreSettings} className="settings-form">{fields.map(([key, label, type]) => <label className={key === "description" || key === "address" ? "setting-wide" : ""} key={key}>{label}{key === "description" ? <textarea name={key} defaultValue={store[key] ?? ""} rows={4}/> : <input name={key} type={type ?? "text"} defaultValue={store[key] ?? ""} required={key === "name"} />}</label>)}<div className="setting-actions"><span>Changes are visible on your storefront.</span><button className="button primary" type="submit">Save changes <span>→</span></button></div></form></>;
}
