import { CommerceClient } from "@/components/CommerceClient";

const categories = ["All", "Mobiles", "Electronics", "Fashion", "Home", "Beauty", "Sports"] as const;

type CommercePageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
};

export default async function CommercePage({ searchParams }: CommercePageProps) {
  const params = await searchParams;
  const requestedCategory = params.category;
  const initialCategory = categories.includes(requestedCategory as (typeof categories)[number])
    ? (requestedCategory as (typeof categories)[number])
    : "All";

  return <CommerceClient initialCategory={initialCategory} initialQuery={params.q ?? ""} />;
}
