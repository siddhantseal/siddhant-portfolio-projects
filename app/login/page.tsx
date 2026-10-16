import Link from "next/link";
import { AccountClient } from "@/components/AccountClient";
import { AuthStatus } from "@/components/AuthStatus";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
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
          <Link className="headerCart" href="/commerce">Shop</Link>
        </div>
      </header>

      <section className="contentHero">
        <p className="eyebrow">Login and signup</p>
        <h1>Authenticate shoppers with a complete account flow.</h1>
        <p>Visitors can sign up, continue with Google, manage profile details, and view order history.</p>
      </section>

      <AccountClient initialMode="login" />
    </main>
  );
}
