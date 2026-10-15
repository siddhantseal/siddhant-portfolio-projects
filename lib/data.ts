export type Product = {
  id: string;
  name: string;
  category: "Audio" | "Workspace" | "Travel" | "Fitness";
  price: number;
  rating: number;
  stock: number;
  image: string;
  accent: string;
  description: string;
};

export const products: Product[] = [
  {
    id: "sonic-pods",
    name: "Sonic Pods",
    category: "Audio",
    price: 2499,
    rating: 4.8,
    stock: 18,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    accent: "#0f766e",
    description: "Low-latency earbuds with active noise control and a compact charging case."
  },
  {
    id: "focus-desk-lamp",
    name: "Focus Desk Lamp",
    category: "Workspace",
    price: 1799,
    rating: 4.6,
    stock: 32,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    accent: "#b45309",
    description: "Dimmable LED lamp with three color modes for late-night study sessions."
  },
  {
    id: "metro-backpack",
    name: "Metro Backpack",
    category: "Travel",
    price: 3299,
    rating: 4.7,
    stock: 11,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    accent: "#1d4ed8",
    description: "Weather-resistant daily backpack with padded laptop and accessory storage."
  },
  {
    id: "pulse-band",
    name: "Pulse Band",
    category: "Fitness",
    price: 2199,
    rating: 4.5,
    stock: 25,
    image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=900&q=80",
    accent: "#be123c",
    description: "Lightweight activity tracker with sleep insights and weekly goal summaries."
  },
  {
    id: "studio-headphones",
    name: "Studio Headphones",
    category: "Audio",
    price: 4999,
    rating: 4.9,
    stock: 9,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    accent: "#4338ca",
    description: "Over-ear wireless headphones tuned for clean calls and immersive playlists."
  },
  {
    id: "standing-pad",
    name: "Standing Pad",
    category: "Workspace",
    price: 1499,
    rating: 4.4,
    stock: 21,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80",
    accent: "#047857",
    description: "Anti-fatigue mat for long coding sessions and standing desk setups."
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
