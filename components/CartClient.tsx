"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { products, type Product } from "@/lib/data";

type Cart = Record<string, number>;

type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

const initialAddress: AddressForm = {
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  state: "West Bengal",
  pincode: ""
};

const deliverySlots = ["Today 6 PM - 9 PM", "Tomorrow 9 AM - 12 PM", "Tomorrow 2 PM - 6 PM", "Weekend delivery"];
const paymentTimes = ["Pay now", "Pay at delivery", "Pay after packing confirmation"];
const gatewaySteps = ["Order", "Method", "Verify", "Done"];

export function CartClient() {
  const syncSourceId = useRef(`sealcart-cart-${Math.random().toString(36).slice(2)}`);
  const cartChannel = useRef<BroadcastChannel | null>(null);
  const hasLoadedCart = useRef(false);
  const skipNextBroadcast = useRef(false);
  const checkoutDetailsRef = useRef<HTMLElement | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [address, setAddress] = useState<AddressForm>(initialAddress);
  const [deliverySlot, setDeliverySlot] = useState(deliverySlots[1]);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentTime, setPaymentTime] = useState(paymentTimes[0]);
  const [paymentStep, setPaymentStep] = useState<"ready" | "processing" | "success" | "failed">("ready");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    try {
      setCart(JSON.parse(window.localStorage.getItem("sealcart-cart") ?? "{}"));
      const savedAddress = window.localStorage.getItem("sealcart-address");
      if (savedAddress) setAddress(JSON.parse(savedAddress) as AddressForm);
    } catch {
      setCart({});
    }

    hasLoadedCart.current = true;

    if ("BroadcastChannel" in window) {
      cartChannel.current = new BroadcastChannel("sealcart-commerce-live");
      cartChannel.current.onmessage = (event: MessageEvent<{ type?: string; source?: string; cart?: Cart }>) => {
        if (event.data?.type !== "cart-sync" || event.data.source === syncSourceId.current || !event.data.cart) return;
        skipNextBroadcast.current = true;
        setCart(event.data.cart);
      };
    }

    function syncFromStorage(event: StorageEvent) {
      if (event.key !== "sealcart-cart" || !event.newValue) return;
      try {
        skipNextBroadcast.current = true;
        setCart(JSON.parse(event.newValue) as Cart);
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

    cartChannel.current?.postMessage({
      type: "cart-sync",
      source: syncSourceId.current,
      cart,
      message: "Cart updated from checkout."
    });
  }, [cart]);

  useEffect(() => {
    if (!hasLoadedCart.current) return;
    window.localStorage.setItem("sealcart-address", JSON.stringify(address));
  }, [address]);

  const cartLines = Object.entries(cart)
    .map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity }))
    .filter((line): line is { product: Product; quantity: number } => Boolean(line.product));

  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const savings = cartLines.reduce((sum, line) => sum + (line.product.mrp - line.product.price) * line.quantity, 0);
  const delivery = subtotal > 5000 || subtotal === 0 ? 0 : 149;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + delivery + tax;
  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  const relatedItems = useMemo(() => {
    const cartCategories = new Set(cartLines.map((line) => line.product.category));
    return products
      .filter((product) => !cart[product.id])
      .sort((a, b) => Number(cartCategories.has(b.category)) - Number(cartCategories.has(a.category)) || b.rating - a.rating)
      .slice(0, 6);
  }, [cart, cartLines]);

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
    setStatusMessage("");
  }

  function updateAddress(field: keyof AddressForm, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
    if (paymentStep === "failed") {
      setPaymentStep("ready");
      setStatusMessage("");
    }
  }

  function addRelatedProduct(id: string) {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setStatusMessage("Added suggested item to your cart.");
  }

  function validateCheckout() {
    if (!cartLines.length) return "Your cart is empty.";
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      return "Please complete the delivery address before payment.";
    }
    if (address.phone.replace(/\D/g, "").length < 10) return "Please enter a valid phone number with country code, for example +91 9876543210.";
    if (address.pincode.replace(/\D/g, "").length < 6) return "Please enter a valid pincode.";
    return "";
  }

  function openPayment() {
    const validationMessage = validateCheckout();
    if (validationMessage) {
      setPaymentStep("failed");
      setStatusMessage(validationMessage);
      checkoutDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const emptyField = checkoutDetailsRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        "input:placeholder-shown, textarea:placeholder-shown"
      );
      emptyField?.focus();
      return;
    }
    setPaymentStep("ready");
    setStatusMessage("");
    setIsPaymentOpen(true);
  }

  async function confirmPayment() {
    const validationMessage = validateCheckout();
    if (validationMessage) {
      setStatusMessage(validationMessage);
      setIsPaymentOpen(false);
      return;
    }

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
        items: cartLines.map((line) => ({ id: line.product.id, quantity: line.quantity })),
        address,
        deliverySlot,
        paymentMethod,
        paymentTime
      })
    });
    const data = await response.json();

    if (!response.ok) {
      setPaymentStep("failed");
      setStatusMessage(data.message ?? "Payment failed. Please try again.");
      return;
    }

    const nextOrder = {
      id: data.orderId,
      placedAt: new Date().toISOString(),
      status: paymentTime === "Pay now" ? "Preparing" : "Payment pending",
      eta: deliverySlot,
      paymentId,
      paymentMethod,
      paymentTime,
      address,
      total: data.total,
      items: orderItems
    };

    try {
      const savedOrders = JSON.parse(window.localStorage.getItem("sealcart-orders") ?? "[]");
      window.localStorage.setItem("sealcart-orders", JSON.stringify([nextOrder, ...savedOrders].slice(0, 12)));
    } catch {
      // Order persistence is best-effort for this browser.
    }

    setPaymentStep("success");
    setStatusMessage(`Order ${data.orderId} placed. Delivery: ${deliverySlot}.`);
    setTimeout(() => {
      setIsPaymentOpen(false);
      setCart({});
    }, 900);
  }

  return (
    <>
      <section className="cartHero">
        <div>
          <p className="eyebrow">Shopping cart</p>
          <h1>Review items, delivery address, and payment timing.</h1>
          <p>Manage quantities, add related products, choose delivery timing, and finish checkout from one dedicated cart page.</p>
        </div>
        <aside className="checkoutPanel">
          <span>Cart total</span>
          <strong>Rs {total.toLocaleString("en-IN")}</strong>
          <small>{itemCount} item{itemCount === 1 ? "" : "s"} ready for checkout</small>
        </aside>
      </section>

      <section className="cartPageLayout">
        <div className="cartMainColumn">
          <section className="cartPageCard">
            <div className="sectionTitle">
              <div>
                <p className="eyebrow">Items</p>
                <h2>Your cart</h2>
              </div>
              <Link href="/commerce">Continue shopping</Link>
            </div>
            {cartLines.length ? (
              <div className="cartItemList">
                {cartLines.map((line) => (
                  <article className="cartPageItem" key={line.product.id}>
                    <Link href={`/commerce/${line.product.id}`}>
                      <img alt={line.product.name} src={line.product.image} />
                    </Link>
                    <div>
                      <span>{line.product.category}</span>
                      <h3><Link href={`/commerce/${line.product.id}`}>{line.product.name}</Link></h3>
                      <p>{line.product.description}</p>
                      <strong>Rs {line.product.price.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="cartItemActions">
                      <div className="stepper">
                        <button onClick={() => updateQuantity(line.product.id, -1)} type="button">-</button>
                        <span>{line.quantity}</span>
                        <button onClick={() => updateQuantity(line.product.id, 1)} type="button">+</button>
                      </div>
                      <button className="removeButton" onClick={() => updateQuantity(line.product.id, -line.quantity)} type="button">
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="emptyCartState">
                <h2>Your cart is empty</h2>
                <p>Add products from the marketplace and they will appear here instantly.</p>
                <Link className="button primary" href="/commerce">Start shopping</Link>
              </div>
            )}
          </section>

          <section className="cartPageCard">
            <div className="sectionTitle">
              <div>
                <p className="eyebrow">Related picks</p>
                <h2>You may also like</h2>
              </div>
            </div>
            <div className="relatedCartGrid">
              {relatedItems.map((product) => (
                <article className="relatedCartItem" key={product.id}>
                  <Link href={`/commerce/${product.id}`}>
                    <img alt={product.name} src={product.image} />
                  </Link>
                  <span>{product.badge}</span>
                  <h3>{product.name}</h3>
                  <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
                  <button className="button secondary full" onClick={() => addRelatedProduct(product.id)} type="button">
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="checkoutColumn" ref={checkoutDetailsRef}>
          <section className="cartPageCard">
            <h2>Delivery address</h2>
            <div className="checkoutFormGrid">
              <label>
                Full name
                <input required placeholder="Full name" value={address.fullName} onChange={(event) => updateAddress("fullName", event.target.value)} />
              </label>
              <label>
                Phone number
                <input required placeholder="+91 9876543210" value={address.phone} onChange={(event) => updateAddress("phone", event.target.value)} />
              </label>
              <label className="wide">
                Address
                <textarea required placeholder="House number, street, area" rows={3} value={address.line1} onChange={(event) => updateAddress("line1", event.target.value)} />
              </label>
              <label>
                City
                <input required placeholder="City" value={address.city} onChange={(event) => updateAddress("city", event.target.value)} />
              </label>
              <label>
                State
                <input required placeholder="State" value={address.state} onChange={(event) => updateAddress("state", event.target.value)} />
              </label>
              <label>
                Pincode
                <input required placeholder="6-digit pincode" value={address.pincode} onChange={(event) => updateAddress("pincode", event.target.value)} />
              </label>
              <label>
                Delivery slot
                <select value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value)}>
                  {deliverySlots.map((slot) => <option key={slot}>{slot}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section className="cartPageCard">
            <h2>Payment</h2>
            <div className="paymentMethods cartPaymentMethods" aria-label="Payment method">
              {["UPI", "Card", "Wallet", "Netbanking"].map((method) => (
                <button className={paymentMethod === method ? "active" : ""} key={method} onClick={() => setPaymentMethod(method)} type="button">
                  {method}
                </button>
              ))}
            </div>
            <label className="checkoutSelectLabel">
              Payment time
              <select value={paymentTime} onChange={(event) => setPaymentTime(event.target.value)}>
                {paymentTimes.map((time) => <option key={time}>{time}</option>)}
              </select>
            </label>
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>Rs {subtotal.toLocaleString("en-IN")}</dd></div>
              <div><dt>Savings</dt><dd>Rs {savings.toLocaleString("en-IN")}</dd></div>
              <div><dt>Delivery</dt><dd>Rs {delivery.toLocaleString("en-IN")}</dd></div>
              <div><dt>GST</dt><dd>Rs {tax.toLocaleString("en-IN")}</dd></div>
              <div className="grand"><dt>Total</dt><dd>Rs {total.toLocaleString("en-IN")}</dd></div>
            </dl>
            <button className="button primary full" disabled={!cartLines.length || paymentStep === "processing"} onClick={openPayment} type="button">
              Proceed to checkout
            </button>
            {statusMessage ? <p className={`contactStatus ${paymentStep === "failed" ? "error" : "success"}`}>{statusMessage}</p> : null}
          </section>
        </aside>
      </section>

      {isPaymentOpen ? (
        <div className="paymentOverlay" role="dialog" aria-modal="true" aria-label="Payment confirmation">
          <section className={`paymentModal gatewayModal ${paymentStep}`}>
            <div className="paymentTop">
              <div>
                <span>Razorpay-style secure checkout</span>
                <h2>Complete payment</h2>
              </div>
              <button onClick={() => setIsPaymentOpen(false)} type="button">Close</button>
            </div>
            <div className="gatewayHero" aria-hidden="true">
              <div className="gatewayOrb">
                <span>{paymentStep === "success" ? "✓" : "₹"}</span>
              </div>
              <div>
                <small>SealCart Pay</small>
                <strong>Bank-grade payment confirmation</strong>
              </div>
            </div>
            <div className="gatewaySteps" aria-label="Payment progress">
              {gatewaySteps.map((step, index) => {
                const currentIndex = paymentStep === "ready" ? 1 : paymentStep === "processing" ? 2 : paymentStep === "success" ? 3 : 1;
                return (
                  <span className={index <= currentIndex ? "done" : ""} key={step}>
                    <i>{index < currentIndex || paymentStep === "success" ? "✓" : index + 1}</i>
                    {step}
                  </span>
                );
              })}
            </div>
            <div className="paymentMerchant">
              <div>
                <strong>SealCart order</strong>
                <span>{paymentMethod} - {paymentTime}</span>
              </div>
              <strong>Rs {total.toLocaleString("en-IN")}</strong>
            </div>
            <div className="deliveryBox">
              <strong>{address.fullName}</strong>
              <span>{address.line1}, {address.city}, {address.state} - {address.pincode}</span>
              <span>{deliverySlot}</span>
            </div>
            <div className={`paymentState ${paymentStep}`}>
              <span className="stateDot" />
              {paymentStep === "ready" ? "Ready to place your order." : null}
              {paymentStep === "processing" ? "Verifying payment, bank response, and order token..." : null}
              {paymentStep === "success" ? "Payment verified. Order placed successfully." : null}
              {paymentStep === "failed" ? "Payment failed. No order was created." : null}
            </div>
            <div className="paymentActions">
              <button className="button secondary full" disabled={paymentStep === "processing"} onClick={() => setPaymentStep("failed")} type="button">
                Mark payment failed
              </button>
              <button className="button primary full" disabled={paymentStep === "processing" || paymentStep === "success"} onClick={confirmPayment} type="button">
                {paymentStep === "processing" ? "Processing..." : `Pay Rs ${total.toLocaleString("en-IN")}`}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
