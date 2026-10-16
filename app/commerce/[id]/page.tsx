import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthStatus } from "@/components/AuthStatus";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ProductZoomGallery } from "@/components/ProductZoomGallery";
import { ThemeToggle } from "@/components/ThemeToggle";
import { products } from "@/lib/data";

const mediaByCategory = {
  Mobiles: "/media/phone-demo.gif",
  Electronics: "/media/audio-demo.gif",
  Fashion: "/media/fashion-demo.gif",
  Home: "/media/tablet-demo.gif",
  Beauty: "/media/fashion-demo.gif",
  Sports: "/media/tablet-demo.gif"
} as const;

const reviews = [
  {
    name: "Riya Sharma",
    rating: "5.0",
    text: "The product page is clear, the gallery helps compare details, and checkout totals are easy to understand."
  },
  {
    name: "Arjun Mehta",
    rating: "4.8",
    text: "Good pricing layout, fast category browsing, and the related product suggestions feel useful."
  },
  {
    name: "Neha Das",
    rating: "4.7",
    text: "The images, feature list, and delivery information make the shopping flow feel reliable."
  }
];

function productTokens(name: string) {
  return new Set(
    name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !["pro", "max", "plus", "elite", "prime", "active", "daily", "luxe", "modern", "classic", "premium", "everyday", "weekend"].includes(token))
  );
}

function similarityScore(currentName: string, candidateName: string) {
  const currentTokens = productTokens(currentName);
  const candidateTokens = productTokens(candidateName);
  let score = 0;

  currentTokens.forEach((token) => {
    if (candidateTokens.has(token)) score += 4;
    if (candidateName.toLowerCase().includes(token)) score += 1;
  });

  return score;
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
};

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { id } = await params;
  const sourceParams = await searchParams;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const backParams = new URLSearchParams();
  if (sourceParams.category) backParams.set("category", sourceParams.category);
  if (sourceParams.q) backParams.set("q", sourceParams.q);
  const backHref = backParams.toString() ? `/commerce?${backParams.toString()}` : "/commerce";
  const media = product.gallery?.length ? product.gallery : [product.image];
  const relatedProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .map((item) => ({
      item,
      score: similarityScore(product.name, item.name)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating)
    .map(({ item }) => item)
    .slice(0, 4);

  return (
    <main>
      <header className="storeHeader compact">
        <Link className="brand" href="/">SealCart</Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/commerce">Shop</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <HeaderSearch />
        <div className="headerActions">
          <AuthStatus />
          <ThemeToggle />
          <Link className="headerCart" href={backHref}>Back to shop</Link>
        </div>
      </header>

      <section className="productDetail">
        <div className="galleryPanel">
          <ProductZoomGallery images={media} productName={product.name} />
        </div>

        <div className="detailInfo">
          <p className="eyebrow">{product.badge}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="detailRating">
            <strong>{product.rating} stars</strong>
            <span>{product.reviews.toLocaleString("en-IN")} verified-style reviews</span>
          </div>
          <div className="detailPrice">
            <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
            <span><s>Rs {product.mrp.toLocaleString("en-IN")}</s> {Math.round((1 - product.price / product.mrp) * 100)}% off</span>
          </div>
          <div className="detailActions">
            <Link className="button primary" href="/commerce">Add from shop cart</Link>
            <Link className="button secondary" href="/commerce">Compare more products</Link>
          </div>
          <div className="deliveryBox">
            <strong>Delivery and services</strong>
            <span>Free delivery above Rs 5,000, 7-day replacement support, and stock visibility.</span>
          </div>
        </div>
      </section>

      <section className="productMediaSection">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">More images</p>
            <h2>Product gallery</h2>
          </div>
        </div>
        <div className="mediaGallery">
          {media.map((image, index) => (
            <img id={`media-${index + 1}`} alt={`${product.name} gallery ${index + 1}`} key={image} src={image} loading="lazy" decoding="async" />
          ))}
        </div>
      </section>

      <section className="productMediaSection">
        <div className="productVideoDetail">
          <img className="mediaPreview detailMedia" alt={`${product.name} product media`} src={mediaByCategory[product.category]} loading="lazy" decoding="async" />
          <div>
            <p className="eyebrow">Product GIF video</p>
            <h2>Real product-media walkthrough</h2>
            <p>
              This GIF-style product media panel highlights what buyers usually inspect before checkout:
              visuals, build, features, discount, delivery, and trust signals.
            </p>
          </div>
        </div>
      </section>

      <section className="productMediaSection featureSpecGrid">
        <article>
          <h2>Key features</h2>
          <ul>
            {(product.features ?? ["Trusted quality", "Great value", "Fast delivery", "Easy replacement"]).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Specifications</h2>
          <dl className="specList">
            {(product.specs ?? [
              { label: "Category", value: product.category },
              { label: "Stock", value: `${product.stock} units` },
              { label: "Warranty", value: "Replacement support" }
            ]).map((spec) => (
              <div key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>

      <section className="productMediaSection">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Customer reviews</p>
            <h2>What buyers are saying</h2>
          </div>
        </div>
        <div className="reviewGrid">
          {reviews.map((review) => (
            <article className="reviewCard" key={review.name}>
              <strong>{review.rating} stars</strong>
              <p>{review.text}</p>
              <span>{review.name}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="productMediaSection">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Recommended</p>
            <h2>Similar products</h2>
          </div>
          <Link href={backHref}>View all</Link>
        </div>
        <div className="dealGrid">
          {relatedProducts.map((item) => (
            <Link className="dealCard" href={`/commerce/${item.id}?category=${encodeURIComponent(product.category)}`} key={item.id}>
              <img alt={item.name} src={item.image} loading="lazy" decoding="async" />
              <span>{item.badge}</span>
              <h3>{item.name}</h3>
              <strong>Rs {item.price.toLocaleString("en-IN")}</strong>
              <small>{Math.round((1 - item.price / item.mrp) * 100)}% off</small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
