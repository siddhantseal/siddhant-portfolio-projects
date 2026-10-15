import Link from "next/link";
import { blogPosts, products } from "@/lib/data";
import { ThemeToggle } from "@/components/ThemeToggle";

const categories = ["Mobiles", "Electronics", "Fashion", "Home", "Beauty", "Sports"];

export default function Home() {
  const topDeals = products.slice(0, 4);

  return (
    <main>
      <header className="storeHeader">
        <Link className="brand" href="/">SealCart</Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/commerce">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="headerActions">
          <ThemeToggle />
          <Link className="headerCart" href="/commerce">Cart</Link>
        </div>
      </header>

      <section className="storeHero">
        <div className="storeHeroCopy">
          <p className="eyebrow">Big sale deals</p>
          <h1>Shop smarter across electronics, fashion, home, and daily essentials.</h1>
          <p>
            SealCart is a full working e-commerce experience with product discovery, category browsing,
            cart management, checkout simulation, support pages, and shopping guides.
          </p>
          <div className="heroActions">
            <Link className="button primary" href="/commerce">Start shopping</Link>
            <Link className="button secondary" href="/about">Why SealCart</Link>
          </div>
        </div>
        <div className="dealShowcase" aria-label="Featured sale product">
          <span className="saleTag">Today only</span>
          <img alt="Featured smartphone deal" src={products[0].image} />
          <div>
            <strong>{products[0].name}</strong>
            <p>From Rs {products[0].price.toLocaleString("en-IN")} with fast delivery.</p>
          </div>
        </div>
      </section>

      <section className="storeBand">
        <div className="storeFeature"><strong>Free delivery</strong><span>On orders above Rs 5,000</span></div>
        <div className="storeFeature"><strong>Easy returns</strong><span>7-day replacement support</span></div>
        <div className="storeFeature"><strong>Secure checkout</strong><span>API-backed order simulation</span></div>
        <div className="storeFeature"><strong>Support</strong><span>Email and phone contact flow</span></div>
      </section>

      <section className="homeSection">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Categories</p>
            <h2>Browse popular departments</h2>
          </div>
          <Link href="/commerce">View all products</Link>
        </div>
        <div className="categoryGrid">
          {categories.map((category) => (
            <Link className="categoryTile" href={`/commerce?category=${category}`} key={category}>
              <span>{category}</span>
              <small>Shop now</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="homeSection">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Product videos</p>
            <h2>Animated product explainers</h2>
          </div>
          <Link href="/commerce">Buy featured items</Link>
        </div>
        <div className="videoGrid">
          <article className="videoCard">
            <div className="videoMock phoneDemo">
              <span />
              <i />
            </div>
            <h3>Nova X1 camera and display</h3>
            <p>Feature preview for shoppers comparing phone performance, storage, display, and battery value.</p>
          </article>
          <article className="videoCard">
            <div className="videoMock audioDemo">
              <span />
              <i />
            </div>
            <h3>AirBeat Pro sound test</h3>
            <p>Animated buyer preview for battery life, comfort, call quality, and low-latency listening.</p>
          </article>
        </div>
      </section>

      <section className="homeSection">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Deals</p>
            <h2>Featured products</h2>
          </div>
          <Link href="/commerce">Go to shop</Link>
        </div>
        <div className="dealGrid">
          {topDeals.map((product) => (
            <Link className="dealCard" href="/commerce" key={product.id}>
              <img alt={product.name} src={product.image} />
              <span>{product.badge}</span>
              <h3>{product.name}</h3>
              <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
              <small>{Math.round((1 - product.price / product.mrp) * 100)}% off</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="homeSection">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">News</p>
            <h2>Shopping guides and updates</h2>
          </div>
          <Link href="/blog">Read blog</Link>
        </div>
        <div className="blogPreviewGrid">
          {blogPosts.map((post) => (
            <article className="blogPreview" key={post.slug}>
              <small>{post.date}</small>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="storeFooter">
        <strong>SealCart</strong>
        <span>Professional e-commerce demo built with Next.js, React, API routes, GitHub, and Vercel.</span>
      </footer>
    </main>
  );
}
