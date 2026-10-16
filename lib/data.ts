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
  gallery?: string[];
  features?: string[];
  specs?: { label: string; value: string }[];
};

const featuredProducts: Product[] = [
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
    description: "128 GB storage, AMOLED display, fast charging, and dual camera system.",
    gallery: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["AMOLED display", "128 GB storage", "Fast charging", "Dual camera"],
    specs: [
      { label: "Display", value: "6.5 inch AMOLED" },
      { label: "Storage", value: "128 GB" },
      { label: "Battery", value: "5000 mAh" }
    ]
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
    description: "Low-latency wireless earbuds with noise control and a 38-hour battery case.",
    gallery: [
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Active noise control", "38-hour case", "Low latency", "Fast pairing"]
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
    description: "Water-resistant casual jacket with breathable lining and secure pockets.",
    gallery: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Water-resistant shell", "Breathable lining", "Secure pockets", "Daily wear fit"]
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
    description: "Dimmable study lamp with three color modes and touch brightness control.",
    gallery: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Touch control", "Three color modes", "Desk-friendly design", "Low power LED"]
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
    description: "Over-ear wireless headphones tuned for clean calls and immersive music.",
    gallery: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Deep bass", "Clear calls", "Foldable design", "Long battery"]
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
    description: "Weather-resistant daily backpack with laptop and accessory storage.",
    gallery: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Laptop pocket", "Weather-resistant", "Travel organizer", "Padded straps"]
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
    description: "Lightweight activity tracker with sleep insights and weekly goal summaries.",
    gallery: [
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Step tracking", "Sleep insights", "Weekly goals", "Water resistant"]
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
    description: "Non-stick cookware set for everyday cooking with easy-clean coating.",
    gallery: [
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Non-stick coating", "Easy clean", "Everyday cookware", "Even heat"]
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
    description: "Daily skincare set with cleanser, serum, moisturizer, and travel pouch.",
    gallery: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Cleanser", "Serum", "Moisturizer", "Travel pouch"]
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
    description: "Compact mechanical keyboard with hot-swap switches and RGB lighting.",
    gallery: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Hot-swap switches", "RGB lighting", "Compact layout", "Creator setup"]
  },
  {
    id: "tabpro-11",
    name: "TabPro 11 Tablet",
    category: "Mobiles",
    price: 27999,
    mrp: 36999,
    rating: 4.6,
    reviews: 1120,
    stock: 12,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=900&q=80",
    accent: "#2563eb",
    badge: "Student pick",
    description: "Slim 11-inch tablet for classes, notes, streaming, and light productivity.",
    gallery: [
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["11-inch display", "Stylus support", "8 GB RAM", "All-day battery"]
  },
  {
    id: "linen-shirt",
    name: "Linen Summer Shirt",
    category: "Fashion",
    price: 1299,
    mrp: 2499,
    rating: 4.4,
    reviews: 540,
    stock: 30,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
    accent: "#0f766e",
    badge: "Fresh drop",
    description: "Breathable casual shirt for college, office, and weekend wear.",
    gallery: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Breathable linen", "Regular fit", "Machine washable", "Smart casual"]
  },
  {
    id: "running-shoes",
    name: "AeroRun Training Shoes",
    category: "Sports",
    price: 2999,
    mrp: 5499,
    rating: 4.5,
    reviews: 733,
    stock: 22,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    accent: "#be123c",
    badge: "Sport deal",
    description: "Lightweight running shoes with cushioned soles and breathable upper.",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Cushioned sole", "Breathable mesh", "Road grip", "Lightweight"]
  },
  {
    id: "smart-watch",
    name: "Orbit Smart Watch",
    category: "Electronics",
    price: 3999,
    mrp: 7999,
    rating: 4.6,
    reviews: 1590,
    stock: 28,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    accent: "#4338ca",
    badge: "Hot deal",
    description: "Bluetooth calling smartwatch with fitness modes and bright always-on display.",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Bluetooth calling", "Health tracking", "AMOLED display", "Metal body"]
  },
  {
    id: "sofa-throw",
    name: "Soft Weave Sofa Throw",
    category: "Home",
    price: 1499,
    mrp: 2999,
    rating: 4.3,
    reviews: 204,
    stock: 36,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    accent: "#b45309",
    badge: "Home refresh",
    description: "Warm textured throw for sofas, beds, and cozy room styling.",
    gallery: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Soft weave", "Machine washable", "Warm texture", "Room decor"]
  },
  {
    id: "matte-lip-kit",
    name: "Matte Lip Color Kit",
    category: "Beauty",
    price: 799,
    mrp: 1499,
    rating: 4.1,
    reviews: 310,
    stock: 48,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80",
    accent: "#be123c",
    badge: "Beauty deal",
    description: "Long-stay matte lip shades for everyday and party looks.",
    gallery: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80"
    ],
    features: ["Long stay", "Matte finish", "Three shades", "Travel friendly"]
  }
];

const categorySeeds: Record<Product["category"], {
  names: string[];
  variants: string[];
  badges: string[];
  images: string[];
  features: string[];
  basePrice: number;
  priceStep: number;
}> = {
  Mobiles: {
    names: ["Astra 5G Phone", "NeoMax Smartphone", "TabLite Student Tablet", "PixelView Tablet", "PowerCell Phone", "NoteMate Tablet", "FoldEdge Phone", "CamPro Smartphone", "MiniPad Tablet", "GameMax Phone", "UltraView Tablet", "Pocket 5G", "Creator Stylus Tablet", "Rugged Outdoor Phone", "Kids Learning Tab", "PhotoPro Camera Phone"],
    variants: ["Prime", "Elite", "Max"],
    badges: ["Exchange offer", "Student pick", "5G deal", "New launch"],
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1605170439002-90845e8c0137?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80"
    ],
    features: ["Fast charging", "Large display", "Long battery", "High storage"],
    basePrice: 8999,
    priceStep: 1350
  },
  Electronics: {
    names: ["WavePods Earbuds", "SoundCore Headphones", "Orbit Smart Watch", "Tactile Keyboard", "Creator Webcam", "USB-C Hub", "Studio Speaker", "Gaming Mouse", "Portable SSD", "WiFi Mesh Router", "Action Camera", "Desk Microphone", "Noise Cancel Soundbar", "Laptop Cooling Stand", "Smart Home Plug", "Mini Projector"],
    variants: ["Pro", "Plus", "Studio"],
    badges: ["Tech deal", "Top rated", "Creator choice", "Best seller"],
    images: [
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80"
    ],
    features: ["Wireless setup", "Fast pairing", "Durable build", "Work-ready"],
    basePrice: 799,
    priceStep: 720
  },
  Fashion: {
    names: ["Linen Casual Shirt", "Urban Denim Jacket", "Metro Backpack", "Classic Sneakers", "Cotton Hoodie", "Formal Slim Trousers", "Canvas Tote Bag", "Knit Polo Tee", "Everyday Chinos", "Bomber Jacket", "Travel Weekender", "Athleisure Joggers", "Leather Belt", "Running Cap", "Oversized Tee", "Minimal White Sneakers"],
    variants: ["Everyday", "Premium", "Weekend"],
    badges: ["Fashion sale", "Fresh drop", "Trending", "Weekend deal"],
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"
    ],
    features: ["Comfort fit", "Daily wear", "Easy care", "Premium feel"],
    basePrice: 699,
    priceStep: 260
  },
  Home: {
    names: ["Ceramic Cookware", "Smart Desk Lamp", "Sofa Throw", "Storage Organizer", "Dinnerware Set", "Study Chair", "Cotton Bedsheet", "Wooden Shelf", "Aroma Diffuser", "Wall Clock", "Coffee Mug Set", "Table Planter", "Air Fryer Basket", "Bath Towel Set", "Bedside Table", "Laundry Hamper"],
    variants: ["Classic", "Modern", "Signature"],
    badges: ["Home refresh", "Kitchen sale", "Work desk", "Limited deal"],
    images: [
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80"
    ],
    features: ["Easy clean", "Space saving", "Modern finish", "Everyday use"],
    basePrice: 499,
    priceStep: 310
  },
  Beauty: {
    names: ["Glow Skin Kit", "Matte Lip Set", "Hydra Serum", "Daily Grooming Kit", "Face Care Combo", "Travel Beauty Pouch", "Vitamin C Cream", "Hair Care Duo", "Fragrance Mist", "Makeup Brush Set", "Sunscreen Gel", "Beard Care Box", "Charcoal Face Wash", "Nail Care Kit", "Body Lotion Duo", "Hair Dryer Brush"],
    variants: ["Daily", "Luxe", "Travel"],
    badges: ["Beauty deal", "Self care", "Limited", "Glow pick"],
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=900&q=80"
    ],
    features: ["Daily routine", "Travel friendly", "Gentle formula", "Value combo"],
    basePrice: 299,
    priceStep: 180
  },
  Sports: {
    names: ["AeroRun Shoes", "PulseFit Band", "Yoga Mat", "Training Bottle", "Gym Duffel", "Cricket Practice Kit", "Resistance Bands", "Football", "Cycling Gloves", "Jump Rope", "Badminton Racket", "Trail Backpack", "Court Basketball Shoes", "Turf Football Shoes", "Training Dumbbells", "Swimming Goggles"],
    variants: ["Active", "Pro", "Endurance"],
    badges: ["Sport deal", "Fitness pick", "Training ready", "Top value"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80"
    ],
    features: ["Lightweight", "Training comfort", "Durable", "Easy carry"],
    basePrice: 399,
    priceStep: 240
  }
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function productImage(category: Product["category"], name: string, index: number, view = 0) {
  const topic = encodeURIComponent(`${category} ${name} product`);
  return `https://source.unsplash.com/900x900/?${topic}&sig=${slugify(category)}-${index}-${view}`;
}

function generatedProducts(): Product[] {
  const result: Product[] = [];
  const categories = Object.keys(categorySeeds) as Product["category"][];

  for (const category of categories) {
    const seed = categorySeeds[category];
    const productCount = seed.names.length * seed.variants.length;
    for (let index = 0; index < productCount; index += 1) {
      const baseName = seed.names[index % seed.names.length];
      const variant = seed.variants[Math.floor(index / seed.names.length) % seed.variants.length];
      const name = `${variant} ${baseName}`;
      const price = seed.basePrice + (index % 12) * seed.priceStep + Math.floor(index / 12) * 500;
      const mrp = Math.round(price * (1.35 + (index % 5) * 0.08));
      const image = productImage(category, name, index);

      result.push({
        id: `${slugify(category)}-${slugify(name)}`,
        name,
        category,
        price,
        mrp,
        rating: Number((4.1 + (index % 9) * 0.08).toFixed(1)),
        reviews: 120 + index * 37,
        stock: 8 + (index % 34),
        image,
        accent: ["#0f766e", "#2563eb", "#be123c", "#b45309"][index % 4],
        badge: seed.badges[index % seed.badges.length],
        description: `${name} with ${seed.features.slice(0, 3).join(", ").toLowerCase()} and dependable SealCart delivery support.`,
        gallery: [
          image,
          productImage(category, name, index, 1),
          productImage(category, name, index, 2)
        ],
        features: seed.features,
        specs: [
          { label: "Category", value: category },
          { label: "Stock", value: `${8 + (index % 34)} units` },
          { label: "Support", value: "7-day replacement support" }
        ]
      });
    }
  }

  return result;
}

export const products: Product[] = [...featuredProducts, ...generatedProducts()];

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
