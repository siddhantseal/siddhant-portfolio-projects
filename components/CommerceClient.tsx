"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { products, type Product } from "@/lib/data";
import { AuthStatus } from "@/components/AuthStatus";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";

type Cart = Record<string, number>;

export const categories = ["All", "Mobiles", "Electronics", "Fashion", "Home", "Beauty", "Sports"] as const;

type CommerceClientProps = {
  initialCategory: (typeof categories)[number];
  initialQuery: string;
};

export function CommerceClient({ initialCategory, initialQuery }: CommerceClientProps) {
  const router = useRouter();
  const syncSourceId = useRef(`sealcart-${Math.random().toString(36).slice(2)}`);
  const cartChannel = useRef<BroadcastChannel | null>(null);
  const hasLoadedCart = useRef(false);
  const skipNextBroadcast = useRef(false);
  const [category, setCategory] = useState<(typeof categories)[number]>(initialCategory);
  const [searchDraft, setSearchDraft] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [cart, setCart] = useState<Cart>({});
  const [liveStatus, setLiveStatus] = useState("Connecting live cart");
  const [liveEvents, setLiveEvents] = useState<string[]>(["Live cart sync will update every open SealCart tab."]);
  const [orderMessage, setOrderMessage] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentStep, setPaymentStep] = useState<"ready" | "processing" | "success" | "failed">("ready");
  const { showToast, ToastViewport } = useToast();

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("sealcart-cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart) as Cart);
      }
    } catch {
      setCart({});
    }

    hasLoadedCart.current = true;

    if ("BroadcastChannel" in window) {
      cartChannel.current = new BroadcastChannel("sealcart-commerce-live");
      cartChannel.current.onmessage = (event: MessageEvent<{ type?: string; source?: string; cart?: Cart; message?: string }>) => {
        if (event.data?.type !== "cart-sync" || event.data.source === syncSourceId.current || !event.data.cart) return;
        skipNextBroadcast.current = true;
        setCart(event.data.cart);
        setLiveEvents((current) => [event.data.message ?? "Cart updated in another tab.", ...current].slice(0, 4));
      };
      setLiveStatus("Live cart sync active");
    } else {
      setLiveStatus("Live sync active through browser storage");
    }

    function syncFromStorage(event: StorageEvent) {
      if (event.key !== "sealcart-cart" || !event.newValue) return;
      try {
        skipNextBroadcast.current = true;
        setCart(JSON.parse(event.newValue) as Cart);
        setLiveEvents((current) => ["Cart updated from another window.", ...current].slice(0, 4));
      } catch {
        // Ignore malformed storage events.
      }
    }

    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      cartChannel.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedCart.current) return;

    window.localStorage.setItem("sealcart-cart", JSON.stringify(cart));
    if (skipNextBroadcast.current) {
      skipNextBroadcast.current = false;
      return;
    }

    const nextCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    cartChannel.current?.postMessage({
      type: "cart-sync",
      source: syncSourceId.current,
      cart,
      message: `Cart synced live: ${nextCount} item${nextCount === 1 ? "" : "s"}.`
    });
  }, [cart]);

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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      filteredProducts.slice(0, 10).forEach((product) => {
        router.prefetch(productHref(product.id));
      });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [filteredProducts, category, query, router]);

  function addToCart(id: string) {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    const product = products.find((item) => item.id === id);
    showToast(`${product?.name ?? "Item"} added to cart.`);
    setLiveEvents((current) => [`Added ${product?.name ?? "product"} to the live cart.`, ...current].slice(0, 4));
    setOrderMessage("");
  }

  function updateQuantity(id: string, delta: number) {
    const product = products.find((item) => item.id === id);
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
    showToast(delta < 0 ? `${product?.name ?? "Item"} removed from cart.` : `${product?.name ?? "Item"} added to cart.`, delta < 0 ? "danger" : "success");
  }

  async function checkout() {
    if (!cartLines.length) return;
    window.location.href = "/cart";
    setOrderMessage("");
  }

  async function confirmPayment() {
    setPaymentStep("processing");
    await new Promise((resolve) => setTimeout(resolve, 900));

    const orderItems = cartLines.map((line) => ({
      id: line.product.id,
      name: line.product.name,
      image: line.product.image,
      price: line.product.price,
      quantity: line.quantity
    }));
    const paymentId = `pay_${Date.now().toString(36)}`;

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartLines.map((line) => ({ id: line.product.id, quantity: line.quantity }))
      })
    });
    const data = await response.json();
    setOrderMessage(response.ok ? `Payment confirmed. ${data.orderId} total: Rs ${data.total}.` : data.message);
    if (response.ok) {
      try {
        const savedOrders = JSON.parse(window.localStorage.getItem("sealcart-orders") ?? "[]");
        const nextOrder = {
          id: data.orderId,
          placedAt: new Date().toISOString(),
          status: "Preparing",
          eta: "Arriving in 2-4 days",
          paymentId,
          paymentMethod,
          total: data.total,
          items: orderItems
        };
        window.localStorage.setItem("sealcart-orders", JSON.stringify([nextOrder, ...savedOrders].slice(0, 12)));
      } catch {
        // Order persistence is best-effort for the storefront.
      }
      setPaymentStep("success");
      setTimeout(() => {
        setIsPaymentOpen(false);
        setCart({});
        setLiveEvents((current) => ["Order placed. Live cart cleared across open tabs.", ...current].slice(0, 4));
      }, 900);
    } else {
      setPaymentStep("failed");
    }
  }

  function markPaymentFailed() {
    setPaymentStep("failed");
    setOrderMessage("Payment failed. Try again or choose another method.");
  }

  function updateShopUrl(nextCategory: (typeof categories)[number], nextQuery: string) {
    const params = new URLSearchParams();
    if (nextCategory !== "All") params.set("category", nextCategory);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    const nextUrl = params.toString() ? `/commerce?${params.toString()}` : "/commerce";
    window.history.replaceState(null, "", nextUrl);
  }

  function selectCategory(nextCategory: (typeof categories)[number]) {
    setCategory(nextCategory);
    updateShopUrl(nextCategory, query);
  }

  function submitSearch() {
    const nextQuery = searchDraft.trim();
    setQuery(nextQuery);
    updateShopUrl(category, nextQuery);
  }

  function productHref(id: string) {
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    const suffix = params.toString();
    return suffix ? `/commerce/${id}?${suffix}` : `/commerce/${id}`;
  }

  function prefetchProduct(id: string) {
    router.prefetch(productHref(id));
  }

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
          <Link href="/account">Account</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <HeaderSearch />
        <div className="headerActions">
          <AuthStatus />
          <ThemeToggle />
          <Link className="headerCart" href="/cart">{itemCount} items</Link>
        </div>
      </header>

      <section className="commerceHero shopHero">
        <div>
          <p className="eyebrow">SealCart marketplace</p>
          <h1>Products, offers, cart, and checkout in one working shop.</h1>
          <p>
            Search products, browse departments, add items to the cart, update quantities,
            and place orders through a Next.js API checkout route.
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
                onClick={() => selectCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="serviceNote">
            <strong>Buyer protection</strong>
            <span>Review your cart page for address, delivery slot, payment timing, and order confirmation.</span>
          </div>
        </aside>

        <div className="catalogPanel">
          <section className="productSpotlight">
            <img className="mediaPreview commerceMedia" alt="Nova X1 product media" src="/media/phone-demo.gif" loading="lazy" decoding="async" />
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
            <form
              className="searchForm"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
            >
              <input
                aria-label="Search products"
                placeholder="Search for mobiles, tablets, fashion, headphones"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
              />
              <button className="searchButton" type="submit">Search</button>
            </form>
            <span className="resultCount">{filteredProducts.length} products</span>
          </div>

          <div className="productGrid">
            {filteredProducts.map((product) => (
              <article className="productCard" key={product.id}>
                <Link href={productHref(product.id)} onMouseEnter={() => prefetchProduct(product.id)} onTouchStart={() => prefetchProduct(product.id)}>
                  <img alt={product.name} src={product.image} loading="lazy" decoding="async" />
                </Link>
                <div className="productBody">
                  <span style={{ color: product.accent }}>{product.badge}</span>
                  <h2>
                    <Link href={productHref(product.id)} onMouseEnter={() => prefetchProduct(product.id)} onTouchStart={() => prefetchProduct(product.id)}>{product.name}</Link>
                  </h2>
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
                  <Link className="button secondary full" href={productHref(product.id)} onMouseEnter={() => prefetchProduct(product.id)} onTouchStart={() => prefetchProduct(product.id)}>
                    View product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="cartPanel">
          <h2>Order Summary</h2>
          {cartLines.length === 0 ? (
            <p className="muted">Your cart is empty. Add a product, then open the dedicated cart page for checkout.</p>
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
            Review cart and checkout
          </button>
          {orderMessage ? (
            <p className="orderMessage">
              {orderMessage} {orderMessage.startsWith("Payment confirmed") ? <Link href="/orders">View orders</Link> : null}
            </p>
          ) : null}

          <div className="suggestionBox">
            <h3>Frequently bought together</h3>
            {suggestedProducts.map((product) => (
              <button className="suggestionItem" key={product.id} onClick={() => addToCart(product.id)} type="button">
                <img alt={product.name} src={product.image} loading="lazy" decoding="async" />
                <span>{product.name}</span>
                <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
              </button>
            ))}
          </div>
        </aside>
      </section>
      {isPaymentOpen ? (
        <div className="paymentOverlay" role="dialog" aria-modal="true" aria-label="Razorpay payment confirmation">
          <section className="paymentModal">
            <div className="paymentTop">
              <div>
                <span>Razorpay checkout</span>
                <h2>Confirm payment</h2>
              </div>
              <button onClick={() => setIsPaymentOpen(false)} type="button">Close</button>
            </div>

            <div className="paymentMerchant">
              <div>
                <strong>SealCart Checkout</strong>
                <span>Secure payment verification</span>
              </div>
              <strong>Rs {total.toLocaleString("en-IN")}</strong>
            </div>

            <div className="paymentMethods" aria-label="Payment method">
              {["UPI", "Card", "Wallet", "Netbanking"].map((method) => (
                <button
                  className={paymentMethod === method ? "active" : ""}
                  disabled={paymentStep === "processing"}
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  type="button"
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="paymentFields">
              {paymentMethod === "UPI" ? (
                <label>
                  UPI ID
                  <input readOnly value="customer@upi" />
                </label>
              ) : paymentMethod === "Card" ? (
                <>
                  <label>
                    Card number
                    <input readOnly value="4111 1111 1111 1111" />
                  </label>
                  <label>
                    CVV
                    <input readOnly value="123" />
                  </label>
                </>
              ) : (
                <label>
                  Payment account
                  <input readOnly value={`${paymentMethod.toLowerCase()}_test_user`} />
                </label>
              )}
            </div>

            <div className={`paymentState ${paymentStep}`}>
              {paymentStep === "ready" ? "Ready to verify payment." : null}
              {paymentStep === "processing" ? "Contacting secure payment gateway..." : null}
              {paymentStep === "success" ? "Payment successful. Creating your order..." : null}
              {paymentStep === "failed" ? "Payment failed. No order was created." : null}
            </div>

            <div className="paymentActions">
              <button className="button secondary full" disabled={paymentStep === "processing"} onClick={markPaymentFailed} type="button">
                Mark payment failed
              </button>
              <button className="button primary full" disabled={paymentStep === "processing" || paymentStep === "success"} onClick={confirmPayment} type="button">
                {paymentStep === "processing" ? "Processing..." : `Pay Rs ${total.toLocaleString("en-IN")}`}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      <ToastViewport />
    </main>
  );
}
