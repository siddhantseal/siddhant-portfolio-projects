import Link from "next/link";
import { blogPosts, products } from "@/lib/data";
import { AuthStatus } from "@/components/AuthStatus";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedCommerceShowcase } from "@/components/ui/animated-commerce-showcase";
import { MotionEffects } from "@/components/ui/motion-effects";

const categories = [
  {
    name: "Mobiles",
    image: products.find((product) => product.category === "Mobiles")?.image ?? products[0].image,
    label: "Phones, tablets, and accessories"
  },
  {
    name: "Electronics",
    image: products.find((product) => product.id === "studio-headphones")?.image ?? products[1].image,
    label: "Audio, gadgets, and work tech"
  },
  {
    name: "Fashion",
    image: products.find((product) => product.category === "Fashion")?.image ?? products[2].image,
    label: "Clothing, bags, and daily style"
  },
  {
    name: "Home",
    image: products.find((product) => product.category === "Home")?.image ?? products[3].image,
    label: "Kitchen, decor, and comfort"
  },
  {
    name: "Beauty",
    image: products.find((product) => product.category === "Beauty")?.image ?? products[8].image,
    label: "Skincare and grooming essentials"
  },
  {
    name: "Sports",
    image: products.find((product) => product.category === "Sports")?.image ?? products[6].image,
    label: "Fitness, training, and outdoors"
  }
];
const shoppingMissions = [
  {
    title: "Student tech setup",
    text: "Phones, tablets, earbuds, and backpacks for daily college work.",
    href: "/commerce?q=tablet"
  },
  {
    title: "Work-from-home desk",
    text: "Keyboards, lamps, webcams, storage, and comfort picks.",
    href: "/commerce?q=desk"
  },
  {
    title: "Weekend refresh",
    text: "Fashion, grooming, fitness, and home products in one basket.",
    href: "/commerce?category=Fashion"
  }
];

const storeStats = [
  { value: "232+", label: "listed products" },
  { value: "4.6", label: "average rating" },
  { value: "7-day", label: "replacement flow" },
  { value: "24/7", label: "support pages" }
];

export default function Home() {
  const topDeals = products.slice(0, 4);
  const productStories = [products[0], products[1], products[10]];

  return (
    <main>
      <MotionEffects />
      <header className="storeHeader">
        <Link className="brand" href="/">SealCart</Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/commerce">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <HeaderSearch />
        <div className="headerActions">
          <AuthStatus />
          <ThemeToggle />
          <Link className="headerCart" href="/commerce">Cart</Link>
        </div>
      </header>

      <section className="storeHero" data-scroll-reveal>
        <div className="storeHeroCopy">
          <p className="eyebrow">Big sale deals</p>
          <h1>Shop smarter across electronics, fashion, home, and daily essentials.</h1>
          <p>
            SealCart is a full working e-commerce experience with product discovery, category browsing,
            cart management, checkout, support pages, and shopping guides.
          </p>
          <div className="heroActions">
            <Link className="button primary" href="/commerce">Start shopping</Link>
            <Link className="button secondary" href="/about">Why SealCart</Link>
          </div>
        </div>
        <Link className="dealShowcase" href={`/commerce/${products[0].id}`} aria-label={`Open ${products[0].name}`}>
          <span className="saleTag">Today only</span>
          <img alt="Featured smartphone deal" src={products[0].image} />
          <div>
            <strong>{products[0].name}</strong>
            <p>From Rs {products[0].price.toLocaleString("en-IN")} with fast delivery.</p>
          </div>
        </Link>
      </section>

      <div data-scroll-reveal>
        <AnimatedCommerceShowcase />
      </div>

      <section className="storeBand" data-scroll-reveal>
        <div className="storeFeature"><strong>Free delivery</strong><span>On orders above Rs 5,000</span></div>
        <div className="storeFeature"><strong>Easy returns</strong><span>7-day replacement support</span></div>
        <div className="storeFeature"><strong>Secure checkout</strong><span>API-backed order processing</span></div>
        <div className="storeFeature"><strong>Support</strong><span>Email and phone contact flow</span></div>
      </section>

      <section className="storeStats" aria-label="Store highlights" data-scroll-reveal>
        {storeStats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="homeSection" data-scroll-reveal>
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Categories</p>
            <h2>Browse popular departments</h2>
          </div>
          <Link href="/commerce">View all products</Link>
        </div>
        <div className="categoryGrid">
          {categories.map((category) => (
            <Link className="categoryTile" href={`/commerce?category=${category.name}`} key={category.name}>
              <img alt={`${category.name} department`} src={category.image} />
              <span>{category.name}</span>
              <p>{category.label}</p>
              <small>Shop now</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="homeSection" data-scroll-reveal>
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Quick paths</p>
            <h2>Shop by what you need today</h2>
          </div>
          <Link href="/commerce">Open marketplace</Link>
        </div>
        <div className="quickShopGrid">
          {shoppingMissions.map((mission) => (
            <Link className="quickShopCard" href={mission.href} key={mission.title}>
              <strong>{mission.title}</strong>
              <span>{mission.text}</span>
              <small>Explore collection</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="homeSection" data-scroll-reveal>
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Featured experiences</p>
            <h2>Smooth product previews</h2>
          </div>
          <Link href="/commerce">Explore collection</Link>
        </div>
        <div className="experienceGrid">
          {productStories.map((product, index) => (
            <Link className="experienceCard" href={`/commerce/${product.id}`} key={product.id}>
              <div className="experienceMedia">
                <img alt={product.name} src={product.image} />
                <span>{index === 0 ? "Flagship pick" : index === 1 ? "Audio deal" : "Student favorite"}</span>
              </div>
              <div className="experienceCopy">
                <small>{product.badge}</small>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div>
                  <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
                  <span>{product.rating} stars</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="homeSection" data-scroll-reveal>
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Deals</p>
            <h2>Featured products</h2>
          </div>
          <Link href="/commerce">Go to shop</Link>
        </div>
        <div className="dealGrid">
          {topDeals.map((product) => (
            <Link className="dealCard" href={`/commerce/${product.id}`} key={product.id}>
              <img alt={product.name} src={product.image} />
              <span>{product.badge}</span>
              <h3>{product.name}</h3>
              <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
              <small>{Math.round((1 - product.price / product.mrp) * 100)}% off</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="homeSection" data-scroll-reveal>
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

      <footer className="storeFooter" data-scroll-reveal>
        <div>
          <strong>SealCart</strong>
          <span>Professional e-commerce platform built with Next.js, React, API routes, GitHub, and Vercel.</span>
        </div>
        <div className="footerLinks">
          <Link href="/commerce">Shop</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </footer>
    </main>
  );
}
