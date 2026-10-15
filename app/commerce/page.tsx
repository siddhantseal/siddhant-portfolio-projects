"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { products, type Product } from "@/lib/data";
import { ThemeToggle } from "@/components/ThemeToggle";

type Cart = Record<string, number>;

const categories = ["All", "Mobiles", "Electronics", "Fashion", "Home", "Beauty", "Sports"] as const;

export default function CommercePage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [orderMessage, setOrderMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    if (categories.includes(requestedCategory as (typeof categories)[number])) {
      setCategory(requestedCategory as (typeof categories)[number]);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const queryMatch =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  const cartLines = Object.entries(cart)
    .map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity }))
    .filter((line): line is { product: Product; quantity: number } => Boolean(line.product));

  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const suggestedProducts = products
    .filter((product) => !cartLines.some((line) => line.product.id === product.id))
    .slice(0, 3);
  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const savings = cartLines.reduce((sum, line) => sum + (line.product.mrp - line.product.price) * line.quantity, 0);
  const delivery = subtotal > 5000 || subtotal === 0 ? 0 : 149;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + delivery + tax;

  function addToCart(id: string) {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setOrderMessage("");
  }

  function updateQuantity(id: string, delta: number) {
    setCart((current) => {
      const nextQuantity = (current[id] ?? 0) + delta;
      const next = { ...current };
      if (nextQuantity <= 0) {
        delete next[id];
      } else {
        next[id] = nextQuantity;
      }
      return next;
    });
  }

  async function checkout() {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartLines.map((line) => ({ id: line.product.id, quantity: line.quantity }))
      })
    });
    const data = await response.json();
    setOrderMessage(response.ok ? `Order placed. ${data.orderId} total: Rs ${data.total}.` : data.message);
    if (response.ok) setCart({});
  }

  return (
    <main>
      <header className="storeHeader compact">
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
          <span className="headerCart">{itemCount} items</span>
        </div>
      </header>

      <section className="commerceHero shopHero">
        <div>
          <p className="eyebrow">SealCart marketplace</p>
          <h1>Products, offers, cart, and checkout in one working shop.</h1>
          <p>
            Search products, browse departments, add items to the cart, update quantities,
            and place a simulated order through a Next.js API checkout route.
          </p>
        </div>
        <aside className="checkoutPanel">
          <span>Cart total</span>
          <strong>Rs {total.toLocaleString("en-IN")}</strong>
          <small>{itemCount} item{itemCount === 1 ? "" : "s"} selected</small>
        </aside>
      </section>

      <section className="shopLayout marketLayout">
        <aside className="filterPanel">
          <h2>Departments</h2>
          <div className="segments vertical" aria-label="Product category">
            {categories.map((item) => (
              <button
                className={category === item ? "active" : ""}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="serviceNote">
            <strong>Buyer protection</strong>
            <span>Secure totals, delivery calculation, and order ID confirmation.</span>
          </div>
        </aside>

        <div className="catalogPanel">
          <section className="productSpotlight">
            <div className="videoMock commerceVideo">
              <span />
              <i />
            </div>
            <div>
              <p className="eyebrow">Product spotlight</p>
              <h2>Nova X1 5G explains the full buying flow.</h2>
              <p>
                Compare discount, reviews, stock, delivery, cart totals, GST, savings, and order confirmation
                before checkout.
              </p>
              <div className="featurePills">
                <span>AMOLED display</span>
                <span>Fast charging</span>
                <span>128 GB storage</span>
                <span>Easy replacement</span>
              </div>
            </div>
          </section>

          <div className="toolbar">
            <input
              aria-label="Search products"
              placeholder="Search for mobiles, fashion, headphones"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="resultCount">{filteredProducts.length} products</span>
          </div>

          <div className="productGrid">
            {filteredProducts.map((product) => (
              <article className="productCard" key={product.id}>
                <img alt={product.name} src={product.image} />
                <div className="productBody">
                  <span style={{ color: product.accent }}>{product.badge}</span>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <div className="ratingRow">
                    <strong>{product.rating} stars</strong>
                    <small>{product.reviews.toLocaleString("en-IN")} reviews</small>
                  </div>
                  <div className="productMeta">
                    <div>
                      <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
                      <small><s>Rs {product.mrp.toLocaleString("en-IN")}</s> {Math.round((1 - product.price / product.mrp) * 100)}% off</small>
                    </div>
                    <small>{product.stock} left</small>
                  </div>
                  <button className="button primary full" onClick={() => addToCart(product.id)} type="button">
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="cartPanel">
          <h2>Order Summary</h2>
          {cartLines.length === 0 ? (
            <p className="muted">Your cart is empty. Add a product to test the complete checkout flow.</p>
          ) : (
            <div className="cartLines">
              {cartLines.map((line) => (
                <div className="cartLine" key={line.product.id}>
                  <div>
                    <strong>{line.product.name}</strong>
                    <small>Rs {line.product.price.toLocaleString("en-IN")}</small>
                  </div>
                  <div className="stepper">
                    <button onClick={() => updateQuantity(line.product.id, -1)} type="button">-</button>
                    <span>{line.quantity}</span>
                    <button onClick={() => updateQuantity(line.product.id, 1)} type="button">+</button>
                  </div>
                  <button className="removeButton" onClick={() => updateQuantity(line.product.id, -line.quantity)} type="button">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <dl className="totals">
            <div><dt>Subtotal</dt><dd>Rs {subtotal.toLocaleString("en-IN")}</dd></div>
            <div><dt>Savings</dt><dd>Rs {savings.toLocaleString("en-IN")}</dd></div>
            <div><dt>Delivery</dt><dd>Rs {delivery.toLocaleString("en-IN")}</dd></div>
            <div><dt>GST</dt><dd>Rs {tax.toLocaleString("en-IN")}</dd></div>
            <div className="grand"><dt>Total</dt><dd>Rs {total.toLocaleString("en-IN")}</dd></div>
          </dl>

          <button className="button primary full" disabled={!cartLines.length} onClick={checkout} type="button">
            Place order
          </button>
          {orderMessage ? <p className="orderMessage">{orderMessage}</p> : null}

          <div className="suggestionBox">
            <h3>Frequently bought together</h3>
            {suggestedProducts.map((product) => (
              <button className="suggestionItem" key={product.id} onClick={() => addToCart(product.id)} type="button">
                <img alt={product.name} src={product.image} />
                <span>{product.name}</span>
                <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
