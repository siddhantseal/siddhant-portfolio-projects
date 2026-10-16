import Link from "next/link";
import { products } from "@/lib/data";

const platformSignals = ["Realtime cart", "Google account", "Email support", "Order tracking", "Secure checkout"];

export function AnimatedCommerceShowcase() {
  const heroProducts = [products[0], products[1], products[2]];
  const marqueeProducts = products.slice(3, 11);

  return (
    <section className="commerceMotionShowcase" aria-label="SealCart shopping experience">
      <div className="motionGrid" aria-hidden="true" />
      <div className="motionShowcaseCopy">
        <p className="eyebrow">Modern shopping system</p>
        <h2>Animated product discovery built for a real storefront feel.</h2>
        <p>
          Fast browsing, synced carts, account flows, order history, and polished motion details
          come together in one responsive commerce experience.
        </p>
        <div className="motionPillRow">
          {platformSignals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>
        <div className="motionActions">
          <Link className="button primary shimmerAction" href="/commerce">
            Browse live catalog
          </Link>
          <Link className="button secondary glassAction" href="/account">
            Open account
          </Link>
        </div>
      </div>

      <div className="motionProductStack">
        {heroProducts.map((product, index) => (
          <Link className={`motionProductCard card${index + 1}`} href={`/commerce/${product.id}`} key={product.id}>
            <img alt={product.name} src={product.image} />
            <span>{product.category}</span>
            <strong>{product.name}</strong>
            <small>Rs {product.price.toLocaleString("en-IN")}</small>
          </Link>
        ))}
      </div>

      <div className="productMarquee" aria-label="Trending products">
        <div>
          {[...marqueeProducts, ...marqueeProducts].map((product, index) => (
            <Link className="marqueeProduct" href={`/commerce/${product.id}`} key={`${product.id}-${index}`}>
              <img alt="" src={product.image} />
              <span>{product.name}</span>
              <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
