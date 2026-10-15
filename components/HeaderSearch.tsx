export function HeaderSearch() {
  return (
    <form action="/commerce" className="headerSearch" method="get">
      <input aria-label="Search store" name="q" placeholder="Search products, brands, categories" />
      <button type="submit">Search</button>
    </form>
  );
}
