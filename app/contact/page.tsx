import Link from "next/link";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ContactPage() {
  return (
    <main>
      <header className="storeHeader compact">
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
          <ThemeToggle />
          <Link className="headerCart" href="/commerce">Cart</Link>
        </div>
      </header>

      <section className="contentHero">
        <p className="eyebrow">Support</p>
        <h1>Contact our customer care desk.</h1>
        <p>Use the form for order questions, returns, product help, or partnership enquiries.</p>
      </section>

      <section className="contactLayout">
        <form className="contactForm">
          <label>
            Name
            <input placeholder="Your name" />
          </label>
          <label>
            Email
            <input placeholder="you@example.com" type="email" />
          </label>
          <label>
            Message
            <textarea placeholder="How can we help?" rows={5} />
          </label>
          <button className="button primary" type="button">Send message</button>
        </form>
        <aside className="contactCard">
          <h2>Reach us</h2>
          <p>Email: support@sealcart.example</p>
          <p>Phone: +91 86177 27090</p>
          <p>Service area: Kolkata, West Bengal and pan-India shipping demo.</p>
          <div className="mapBox">Kolkata delivery hub</div>
        </aside>
      </section>
    </main>
  );
}
