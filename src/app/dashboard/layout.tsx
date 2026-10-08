import Link from "next/link";
import { logOut } from "@/lib/auth-actions";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";

const links = [["◫", "Overview", "/dashboard"], ["◇", "Products", "/dashboard/products"], ["↗", "Orders", "/dashboard/orders"], ["♧", "Customers", "/dashboard/customers"], ["▦", "Categories", "/dashboard/categories"], ["▤", "Inventory", "/dashboard/inventory"], ["✳", "Theme", "/dashboard/theme"], ["▧", "Pages", "/dashboard/pages"], ["⌑", "Coupons", "/dashboard/coupons"], ["⚙", "Settings", "/dashboard/settings"]];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const database = await connectDb();
  const membership = await database.orm.public.StoreMember.where({ userId: user.id }).first();
  if (!membership) throw new Error("Your account has no store membership");
  const store = await database.orm.public.Store.where({ id: membership.storeId }).first();
  if (!store) throw new Error("Store not found");
  return <div className="dashboard-shell"><aside className="sidebar"><Link className="brand" href="/">atelier<span>.</span></Link><div className="store-picker"><div className="store-avatar">{store.name.slice(0, 1).toUpperCase()}</div><div><b>{store.name}</b><small>Online store</small></div><span>⌄</span></div><p className="side-label">WORKSPACE</p><nav>{links.map(([icon, label, href]) => <Link key={href} className={href === "/dashboard" ? "active" : ""} href={href}><span>{icon}</span>{label}</Link>)}</nav><div className="side-bottom"><a href={`/store/${store.slug}`} target="_blank" rel="noreferrer">↗ <span>View your store</span></a><div className="profile"><div className="profile-avatar">{user.firstName?.slice(0, 1)}{user.lastName?.slice(0, 1)}</div><div><b>{user.firstName} {user.lastName}</b><small>{user.email}</small></div><form action={logOut}><button aria-label="Sign out" title="Sign out">⇥</button></form></div></div></aside><main className="dashboard-main"><header className="dash-top"><div><span className="breadcrumb">{store.name}</span><span className="breadcrumb-sep">/</span><span>Overview</span></div><a className="store-live" href={`/store/${store.slug}`} target="_blank" rel="noreferrer"><i/> Store live <span>↗</span></a></header><div className="dash-content">{children}</div></main></div>;
}
