"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { products, type Product } from "@/lib/data";

type Cart = Record<string, number>;

const categories = ["All", "Audio", "Workspace", "Travel", "Fitness"] as const;

export default function CommercePage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [orderMessage, setOrderMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const queryMatch =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  const cartLines = Object.entries(cart)
    .map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity }))
    .filter((line): line is { product: Product; quantity: number } => Boolean(line.product));

  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
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
    setOrderMessage(response.ok ? `Payment simulated. Order ${data.orderId} total: Rs ${data.total}.` : data.message);
    if (response.ok) setCart({});
  }

  return (
    <main className="shell">
      <nav className="topNav">
        <Link href="/">Projects</Link>
        <span>Full-Stack E-Commerce</span>
      </nav>

      <section className="commerceHero">
        <div>
          <p className="eyebrow">Storefront demo</p>
          <h1>Responsive catalog, cart, and checkout flow.</h1>
          <p>
            Built to show React state management, API-backed checkout simulation, filtering, totals,
            and a clean customer shopping experience.
          </p>
        </div>
        <aside className="checkoutPanel">
          <span>Cart total</span>
          <strong>Rs {total.toLocaleString("en-IN")}</strong>
          <small>{cartLines.length} unique item{cartLines.length === 1 ? "" : "s"}</small>
        </aside>
      </section>

      <section className="shopLayout">
        <div className="catalogPanel">
          <div className="toolbar">
            <input
              aria-label="Search products"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="segments" aria-label="Product category">
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
          </div>

          <div className="productGrid">
            {filteredProducts.map((product) => (
              <article className="productCard" key={product.id}>
                <img alt={product.name} src={product.image} />
                <div className="productBody">
                  <span style={{ color: product.accent }}>{product.category}</span>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <div className="productMeta">
                    <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
                    <small>{product.rating} rating</small>
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
            <p className="muted">Your cart is empty. Add a product to test the checkout API.</p>
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
                </div>
              ))}
            </div>
          )}

          <dl className="totals">
            <div><dt>Subtotal</dt><dd>Rs {subtotal.toLocaleString("en-IN")}</dd></div>
            <div><dt>Delivery</dt><dd>Rs {delivery.toLocaleString("en-IN")}</dd></div>
            <div><dt>GST</dt><dd>Rs {tax.toLocaleString("en-IN")}</dd></div>
            <div className="grand"><dt>Total</dt><dd>Rs {total.toLocaleString("en-IN")}</dd></div>
          </dl>

          <button className="button primary full" disabled={!cartLines.length} onClick={checkout} type="button">
            Simulate payment
          </button>
          {orderMessage ? <p className="orderMessage">{orderMessage}</p> : null}
        </aside>
      </section>
    </main>
  );
}
