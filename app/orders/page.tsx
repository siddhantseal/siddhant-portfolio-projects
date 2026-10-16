import Link from "next/link";
import { AuthStatus } from "@/components/AuthStatus";
import { HeaderSearch } from "@/components/HeaderSearch";
import { OrdersClient } from "@/components/OrdersClient";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function OrdersPage() {
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
          <Link className="headerCart" href="/commerce">Shop</Link>
        </div>
      </header>

      <section className="contentHero">
        <p className="eyebrow">My orders</p>
        <h1>Track deliveries, current purchases, and previous orders.</h1>
        <p>
          Orders placed through the demo checkout are saved on this browser, alongside sample
          active and delivered orders for a complete ecommerce account experience.
        </p>
      </section>

      <OrdersClient />
    </main>
  );
}
