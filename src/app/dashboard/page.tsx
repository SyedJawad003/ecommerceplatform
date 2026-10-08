import Link from "next/link";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();
  const database = await connectDb();
  const member = await database.orm.public.StoreMember.where({ userId: user.id }).first();
  if (!member) return <p>Your account has no store yet.</p>;
  const store = await database.orm.public.Store.where({ id: member.storeId }).first();
  const products = await database.orm.public.Product.where({ storeId: member.storeId }).all();
  const orders = await database.orm.public.Order.where({ storeId: member.storeId }).all();
  const customers = await database.orm.public.Customer.where({ storeId: member.storeId }).all();
  const lowStock = products;
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const lowStockProducts = lowStock.filter((product) => product.trackInventory && product.stockQuantity <= 5);
  const money = new Intl.NumberFormat("en", { style: "currency", currency: store?.currency ?? "USD" });
  return <><div className="dash-heading"><div><p className="eyebrow">YOUR BUSINESS, IN FOCUS</p><h1>Good morning, {user.firstName}.</h1><p>Here’s what’s happening with {store?.name} today.</p></div><Link className="button primary" href="/dashboard/products">＋ Add a product</Link></div><section className="stat-grid"><article className="stat-card"><span>Products</span><b>{products.length}</b><small>In your catalog</small><i>◇</i></article><article className="stat-card"><span>Orders</span><b>{orders.length}</b><small>All time</small><i>↗</i></article><article className="stat-card"><span>Customers</span><b>{customers.length}</b><small>Across your store</small><i>♧</i></article><article className="stat-card warm"><span>Stock to check</span><b>{lowStockProducts.length}</b><small>{lowStockProducts.length ? "Products running low" : "Inventory looks good"}</small><i>⌑</i></article></section><div className="dash-columns"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">THE LATEST</p><h2>Recent orders</h2></div><Link href="/dashboard/orders">View all <span>↗</span></Link></div>{recentOrders.length ? <div className="order-list">{recentOrders.map(order => <div className="order-row" key={order.id}><div className="order-symbol">↗</div><div className="order-info"><b>Order {order.orderNumber}</b><small>{order.customerEmail}</small></div><span className={`status status-${order.status.toLowerCase()}`}>{order.status.toLowerCase()}</span><b className="order-total">{money.format(Number(order.total))}</b></div>)}</div> : <div className="empty-state"><div>↗</div><h3>Your first order is just around the corner.</h3><p>Once customers start shopping, their orders will show up here.</p><a href={`/store/${store?.slug}`} target="_blank" rel="noreferrer">Visit your storefront ↗</a></div>}</section><aside className="quick-panel"><p className="eyebrow">KEEP THINGS MOVING</p><h2>Quick actions</h2><Link href="/dashboard/products"><span className="quick-icon">＋</span><span><b>Add a product</b><small>Grow your catalog</small></span><i>↗</i></Link><Link href="/dashboard/settings"><span className="quick-icon">⚙</span><span><b>Store settings</b><small>Fine-tune the details</small></span><i>↗</i></Link><Link href="/dashboard/theme"><span className="quick-icon">✳</span><span><b>Customize your look</b><small>Make the shop your own</small></span><i>↗</i></Link><div className="store-card"><small>YOUR STOREFRONT</small><b>{store?.name}</b><a href={`/store/${store?.slug}`} target="_blank" rel="noreferrer">View live store ↗</a><div className="store-card-shape"/></div></aside></div></>;
}
