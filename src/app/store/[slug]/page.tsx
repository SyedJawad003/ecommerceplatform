import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connectDb } from "@/lib/db";

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const database = await connectDb();
  const store = await database.orm.public.Store.where({ slug, status: "ACTIVE" }).first();
  if (!store) notFound();
  const products = await database.orm.public.Product.where({ storeId: store.id, status: "ACTIVE" }).orderBy((product) => product.createdAt.desc()).all();
  const cards = await Promise.all(products.map(async (product) => {
    const link = await database.orm.public.ProductMedia.where({ productId: product.id, isPrimary: true }).first();
    const media = link ? await database.orm.public.Media.where({ id: link.mediaId, storeId: store.id }).first() : null;
    return { product, imageUrl: media?.url };
  }));
  const money = new Intl.NumberFormat("en", { style: "currency", currency: store.currency });
  return <main className="shop-page"><header className="shop-nav"><Link className="brand" href={`/store/${store.slug}`}>{store.name}<span>.</span></Link><span>CONSIDERED GOODS, CHOSEN WITH CARE</span><a href="#collection">Explore collection ↓</a></header><section className="shop-hero"><p className="eyebrow">A LITTLE SPACE FOR LOVELY THINGS</p><h1>{store.name}</h1><p>{store.description || "Thoughtful pieces for everyday life. Find something that feels like you."}</p><a className="button dark" href="#collection">Explore the collection <span>↓</span></a><div className="shop-hero-art"><span>THE NEW<br/>EVERYDAY</span><i/><b/></div></section><section id="collection" className="shop-collection"><div className="collection-heading"><div><p className="eyebrow">MADE TO BE LIVED WITH</p><h2>Find your favorite.</h2></div><span>{products.length} {products.length === 1 ? "piece" : "pieces"}</span></div>{products.length ? <div className="shop-grid">{cards.map(({ product, imageUrl }) => <article className="shop-product" key={product.id}><div className="shop-product-image">{imageUrl ? <Image src={imageUrl} alt={product.name} fill sizes="(max-width: 650px) 50vw, 33vw" unoptimized /> : <div className="product-placeholder">{store.name.slice(0, 1)}</div>}<span>DISCOVER ↗</span></div><div className="shop-product-meta"><h3>{product.name}</h3><b>{money.format(Number(product.price))}</b></div>{product.shortDescription && <p>{product.shortDescription}</p>}</article>)}</div> : <div className="shop-empty"><span>✳</span><h3>Something lovely is on its way.</h3><p>Check back soon to explore the collection.</p></div>}</section><footer className="shop-footer"><b>{store.name}</b><span>Thoughtfully yours, always.</span><a href={`mailto:${store.contactEmail ?? ""}`}>Get in touch ↗</a></footer></main>;
}
