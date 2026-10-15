export type Product = {
  id: string;
  name: string;
  category: "Mobiles" | "Electronics" | "Fashion" | "Home" | "Beauty" | "Sports";
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  accent: string;
  badge: string;
  description: string;
};

export const products: Product[] = [
  {
    id: "nova-x1-phone",
    name: "Nova X1 5G Smartphone",
    category: "Mobiles",
    price: 18999,
    mrp: 24999,
    rating: 4.8,
    reviews: 1842,
    stock: 18,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    accent: "#0f766e",
    badge: "Bank offer",
    description: "128 GB storage, AMOLED display, fast charging, and dual camera system."
  },
  {
    id: "airbeat-pro",
    name: "AirBeat Pro Earbuds",
    category: "Electronics",
    price: 2499,
    mrp: 5999,
    rating: 4.6,
    reviews: 928,
    stock: 32,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    accent: "#b45309",
    badge: "Best seller",
    description: "Low-latency wireless earbuds with noise control and a 38-hour battery case."
  },
  {
    id: "urban-jacket",
    name: "Urban Utility Jacket",
    category: "Fashion",
    price: 2199,
    mrp: 3999,
    rating: 4.7,
    reviews: 612,
    stock: 11,
    image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
    accent: "#1d4ed8",
    badge: "Trending",
    description: "Water-resistant casual jacket with breathable lining and secure pockets."
  },
  {
    id: "smart-work-lamp",
    name: "Smart Desk Lamp",
    category: "Home",
    price: 1799,
    mrp: 2999,
    rating: 4.5,
    reviews: 477,
    stock: 25,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    accent: "#be123c",
    badge: "Deal",
    description: "Dimmable study lamp with three color modes and touch brightness control."
  },
  {
    id: "studio-headphones",
    name: "Studio Max Headphones",
    category: "Electronics",
    price: 4999,
    mrp: 8999,
    rating: 4.9,
    reviews: 1320,
    stock: 9,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    accent: "#4338ca",
    badge: "Top rated",
    description: "Over-ear wireless headphones tuned for clean calls and immersive music."
  },
  {
    id: "metro-backpack",
    name: "Metro Laptop Backpack",
    category: "Fashion",
    price: 3299,
    mrp: 4999,
    rating: 4.4,
    reviews: 371,
    stock: 21,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    accent: "#047857",
    badge: "New arrival",
    description: "Weather-resistant daily backpack with laptop and accessory storage."
  },
  {
    id: "pulse-band",
    name: "PulseFit Smart Band",
    category: "Sports",
    price: 2199,
    mrp: 3499,
    rating: 4.5,
    reviews: 701,
    stock: 25,
    image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=900&q=80",
    accent: "#be123c",
    badge: "Fitness pick",
    description: "Lightweight activity tracker with sleep insights and weekly goal summaries."
  },
  {
    id: "ceramic-cookware",
    name: "Ceramic Cookware Set",
    category: "Home",
    price: 2799,
    mrp: 5499,
    rating: 4.3,
    reviews: 286,
    stock: 16,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
    accent: "#b45309",
    badge: "Kitchen sale",
    description: "Non-stick cookware set for everyday cooking with easy-clean coating."
  },
  {
    id: "glow-kit",
    name: "Glow Essentials Kit",
    category: "Beauty",
    price: 999,
    mrp: 1799,
    rating: 4.2,
    reviews: 198,
    stock: 40,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    accent: "#be123c",
    badge: "Limited",
    description: "Daily skincare set with cleanser, serum, moisturizer, and travel pouch."
  },
  {
    id: "mechanical-keyboard",
    name: "Tactile Mechanical Keyboard",
    category: "Electronics",
    price: 3499,
    mrp: 5999,
    rating: 4.7,
    reviews: 804,
    stock: 14,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    accent: "#2563eb",
    badge: "Creator choice",
    description: "Compact mechanical keyboard with hot-swap switches and RGB lighting."
  }
];

export const blogPosts = [
  {
    slug: "festival-sale-guide",
    title: "How to pick the best deals during a festival sale",
    date: "15 Oct 2026",
    excerpt: "A practical checklist for comparing real discounts, delivery terms, warranty, and exchange value."
  },
  {
    slug: "safe-online-checkout",
    title: "What makes an online checkout trustworthy",
    date: "12 Oct 2026",
    excerpt: "From cart totals to payment simulation, here are the signals customers expect before placing an order."
  },
  {
    slug: "electronics-buying-tips",
    title: "Electronics buying tips for students and new professionals",
    date: "08 Oct 2026",
    excerpt: "Balance budget, durability, support, and daily productivity before buying gadgets online."
  }
];

export type Task = {
  id: string;
  title: string;
  owner: string;
  priority: "Low" | "Medium" | "High";
  status: "Backlog" | "Active" | "Review" | "Done";
  updatedAt: string;
};

export const starterTasks: Task[] = [
  {
    id: "api-contract",
    title: "Finalize workspace API contract",
    owner: "Siddhant",
    priority: "High",
    status: "Active",
    updatedAt: "09:30"
  },
  {
    id: "auth-flow",
    title: "JWT auth and guarded routes",
    owner: "Frontend",
    priority: "High",
    status: "Review",
    updatedAt: "10:05"
  },
  {
    id: "task-filters",
    title: "Team filters and quick search",
    owner: "Design",
    priority: "Medium",
    status: "Backlog",
    updatedAt: "10:20"
  },
  {
    id: "socket-events",
    title: "Socket room event handlers",
    owner: "Backend",
    priority: "Medium",
    status: "Active",
    updatedAt: "10:45"
  }
];
