import Link from "next/link";
const sections: Record<string, { title: string; description: string; icon: string }> = {
  products: { title: "Products", description: "Build your catalog and make it easy for people to find something they love.", icon: "◇" },
  orders: { title: "Orders", description: "Every customer order, together in one easy to follow place.", icon: "↗" },
  customers: { title: "Customers", description: "Get to know the people who make your business possible.", icon: "♧" },
  categories: { title: "Categories", description: "Organize your products into collections that make sense to shoppers.", icon: "▦" },
  inventory: { title: "Inventory", description: "Keep an eye on availability and stay ahead of low stock.", icon: "▤" },
  theme: { title: "Theme", description: "Make the storefront feel like your brand, down to the details.", icon: "✳" },
  pages: { title: "Pages", description: "Add the helpful pages every great storefront needs.", icon: "▧" },
  coupons: { title: "Coupons", description: "Give customers a reason to come back with a thoughtful offer.", icon: "⌑" },
};
export default async function PlaceholderPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = sections[section];
  if (!item) return <section className="coming-card"><span>404</span><h1>We couldn&apos;t find that page.</h1><Link href="/dashboard">Back to overview ↗</Link></section>;
  return <><div className="dash-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>{item.title}</h1><p>{item.description}</p></div></div><section className="coming-card"><span>{item.icon}</span><p className="eyebrow">COMING INTO FOCUS</p><h2>{item.title} tools are on their way.</h2><p>We’re preparing a thoughtful set of tools for this part of your business. Your store data will live right here.</p><Link className="button primary" href="/dashboard">Back to your overview <span>↗</span></Link></section></>;
}
