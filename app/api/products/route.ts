import { NextResponse } from "next/server";
import { products } from "@/lib/data";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.toLowerCase() ?? "";

  const result = products.filter((product) => {
    const matchesCategory = !category || category === "All" || product.category === category;
    const matchesQuery =
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  return NextResponse.json({ products: result });
}
