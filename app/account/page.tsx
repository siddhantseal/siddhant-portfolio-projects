import Link from "next/link";
import { AccountClient } from "@/components/AccountClient";
import { AuthStatus } from "@/components/AuthStatus";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AccountPage() {
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
          <Link className="headerCart" href="/cart">Cart</Link>
        </div>
      </header>

      <section className="contentHero">
        <p className="eyebrow">My account</p>
        <h1>Profile, orders, and account controls in one dashboard.</h1>
        <p>Change the profile picture, update the display name, logout, and review past purchases.</p>
      </section>

      <AccountClient initialMode="login" />
    </main>
  );
}
