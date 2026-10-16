import Link from "next/link";
import { products } from "@/lib/data";

const shoppingSignals = ["Fresh deals", "Fast delivery", "Easy returns", "Top brands", "Secure payments"];

export function AnimatedCommerceShowcase() {
  const heroProducts = [products[0], products[1], products[2]];
  const marqueeProducts = products.slice(3, 11);

  return (
    <section className="commerceMotionShowcase" aria-label="SealCart featured deals">
      <div className="motionGrid" aria-hidden="true" />
      <div className="motionShowcaseCopy">
        <p className="eyebrow">Today&apos;s best picks</p>
        <h2>Big savings across phones, fashion, home, beauty, and daily essentials.</h2>
        <p>
          Discover handpicked deals, compare popular products, add everything to your cart,
          and get quick delivery updates from your account.
        </p>
        <div className="motionPillRow">
          {shoppingSignals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>
        <div className="motionActions">
          <Link className="button primary shimmerAction" href="/commerce">
            Shop today&apos;s deals
          </Link>
          <Link className="button secondary glassAction" href="/account">
            Track my orders
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
