import Link from "next/link";
import { AuthStatus } from "@/components/AuthStatus";
import { ContactForm } from "@/components/ContactForm";
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
          <AuthStatus />
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
        <ContactForm />
        <aside className="contactCard">
          <h2>Reach us</h2>
          <p>Email: support@sealcart.in</p>
          <p>Phone: +91 86177 27090</p>
          <p>Service area: Kolkata, West Bengal and pan-India shipping.</p>
          <p>Customers receive an automatic email confirmation when the email provider is configured.</p>
          <div className="mapBox">Kolkata delivery hub</div>
        </aside>
      </section>
    </main>
  );
}
