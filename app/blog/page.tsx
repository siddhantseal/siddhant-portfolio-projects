import Link from "next/link";
import { blogPosts } from "@/lib/data";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function BlogPage() {
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
        <HeaderSearch />
        <div className="headerActions">
          <ThemeToggle />
          <Link className="headerCart" href="/commerce">Shop deals</Link>
        </div>
      </header>

      <section className="contentHero">
        <p className="eyebrow">Blog and news</p>
        <h1>Shopping guides, sale updates, and product tips.</h1>
        <p>Helpful articles that make the e-commerce site feel complete and content-ready.</p>
      </section>

      <section className="articleList">
        {blogPosts.map((post) => (
          <article className="articleCard" key={post.slug}>
            <small>{post.date}</small>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <Link href="/commerce">Shop related products</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
