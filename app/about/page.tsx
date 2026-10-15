import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AboutPage() {
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
          <Link className="headerCart" href="/commerce">Shop now</Link>
        </div>
      </header>

      <section className="contentHero">
        <p className="eyebrow">About SealCart</p>
        <h1>Built like a real marketplace, focused on trust and speed.</h1>
        <p>
          SealCart is a professional e-commerce demo that shows product discovery, department pages,
          cart logic, checkout APIs, customer support, and content sections expected in a modern online store.
        </p>
      </section>

      <section className="infoGrid">
        <article>
          <h2>Mission</h2>
          <p>Make online shopping simple, transparent, and fast for customers comparing products and offers.</p>
        </article>
        <article>
          <h2>Technology</h2>
          <p>Next.js, React, TypeScript, API routes, responsive CSS, Vercel deployment, and GitHub source control.</p>
        </article>
        <article>
          <h2>Customer Promise</h2>
          <p>Clear pricing, visible savings, delivery estimates, secure checkout simulation, and easy contact options.</p>
        </article>
      </section>
    </main>
  );
}
