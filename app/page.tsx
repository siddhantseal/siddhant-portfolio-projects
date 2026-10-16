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
  { value: "200+", label: "listed products" },
  { value: "4.6", label: "average rating" },
  { value: "7-day", label: "replacement flow" },
  { value: "24/7", label: "support pages" }
];

const customerReviews = [
  {
    name: "Riya Sharma",
    city: "Kolkata",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=140&q=80",
    rating: "5.0",
    text: "The phone deals were clear, delivery updates were easy to follow, and checkout felt quick."
  },
  {
    name: "Arjun Mehta",
    city: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=140&q=80",
    rating: "4.8",
    text: "I liked how electronics, fashion, and home products were all easy to compare in one place."
  },
  {
    name: "Neha Das",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=140&q=80",
    rating: "4.9",
    text: "The order section and account page make repeat shopping feel smooth and trustworthy."
  }
];

const shopperAvatars = customerReviews.map((review) => review.avatar);

export default function Home() {
  const topDeals = products.slice(0, 4);
  const productStories = [products[0], products[1], products[10]];

  return (
    <main>
      <div className="siteShader" aria-hidden="true" />
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

      <section className="shopperLoveSection" data-scroll-reveal>
        <div className="shopperLoveHeader">
          <div>
            <p className="eyebrow">Customer reviews</p>
            <h2>Trusted by shoppers across India</h2>
            <p>Real marketplace details customers care about: clear pricing, fast discovery, order tracking, and support.</p>
          </div>
          <div className="avatarStack" aria-label="Recent customers">
            {shopperAvatars.map((avatar) => (
              <img alt="" src={avatar} key={avatar} />
            ))}
            <span>2k+</span>
          </div>
        </div>
        <div className="testimonialGrid">
          {customerReviews.map((review) => (
            <article className="testimonialCard" key={review.name}>
              <div className="testimonialTop">
                <img alt={`${review.name} avatar`} src={review.avatar} />
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.city}</span>
                </div>
                <small>{review.rating} stars</small>
              </div>
              <p>{review.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="homeSection brandAssurance" data-scroll-reveal>
        <div className="assuranceCard">
          <span>Secure payments</span>
          <strong>UPI, cards, wallets, and netbanking</strong>
        </div>
        <div className="assuranceCard">
          <span>Easy returns</span>
          <strong>Replacement support on eligible orders</strong>
        </div>
        <div className="assuranceCard">
          <span>Account benefits</span>
          <strong>Track orders and manage your profile</strong>
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
          <span>Shop electronics, fashion, home, beauty, sports, and daily essentials with fast support.</span>
        </div>
        <div className="footerLinks">
          <Link href="/commerce">Shop</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footerColumns">
          <section>
            <h3>Departments</h3>
            <Link href="/commerce?category=Mobiles">Mobiles</Link>
            <Link href="/commerce?category=Electronics">Electronics</Link>
            <Link href="/commerce?category=Fashion">Fashion</Link>
            <Link href="/commerce?category=Home">Home</Link>
          </section>
          <section>
            <h3>Customer care</h3>
            <Link href="/orders">Track orders</Link>
            <Link href="/contact">Returns help</Link>
            <Link href="/contact">Product support</Link>
            <Link href="/account">My account</Link>
          </section>
          <section>
            <h3>SealCart</h3>
            <Link href="/about">About us</Link>
            <Link href="/blog">Shopping guides</Link>
            <Link href="/commerce">Today&apos;s deals</Link>
            <Link href="/contact">Contact</Link>
          </section>
        </div>
        <div className="footerTrust">
          <span>Secure checkout</span>
          <span>Fast delivery</span>
          <span>7-day replacement flow</span>
          <span>Support: +91 86177 27090</span>
        </div>
      </footer>
    </main>
  );
}
