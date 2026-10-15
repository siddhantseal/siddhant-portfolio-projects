"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  placedAt: string;
  status: string;
  eta: string;
  total: number;
  items: OrderItem[];
};

const sampleOrders: Order[] = [
  {
    id: "ORD-DEMO-4812",
    placedAt: "2026-10-14T10:30:00.000Z",
    status: "Out for delivery",
    eta: "Arriving today",
    total: 21498,
    items: [
      {
        id: "nova-x1-phone",
        name: "Nova X1 5G Smartphone",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
        price: 18999,
        quantity: 1
      },
      {
        id: "airbeat-pro",
        name: "AirBeat Pro Earbuds",
        image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80",
        price: 2499,
        quantity: 1
      }
    ]
  },
  {
    id: "ORD-DEMO-3924",
    placedAt: "2026-10-11T12:05:00.000Z",
    status: "Delivered",
    eta: "Delivered on 13 Oct",
    total: 5798,
    items: [
      {
        id: "urban-jacket",
        name: "Urban Utility Jacket",
        image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
        price: 2199,
        quantity: 1
      },
      {
        id: "smart-work-lamp",
        name: "Smart Desk Lamp",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
        price: 1799,
        quantity: 2
      }
    ]
  }
];

export function OrdersClient() {
  const [savedOrders, setSavedOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      setSavedOrders(JSON.parse(window.localStorage.getItem("sealcart-orders") ?? "[]"));
    } catch {
      setSavedOrders([]);
    }
  }, []);

  const orders = useMemo(() => [...savedOrders, ...sampleOrders], [savedOrders]);
  const currentOrders = orders.filter((order) => order.status !== "Delivered");
  const previousOrders = orders.filter((order) => order.status === "Delivered");

  return (
    <section className="ordersLayout">
      <div className="ordersSummary">
        <article>
          <span>Active</span>
          <strong>{currentOrders.length}</strong>
        </article>
        <article>
          <span>Previous</span>
          <strong>{previousOrders.length}</strong>
        </article>
        <article>
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </article>
      </div>

      <div className="ordersColumn">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Coming soon</p>
            <h2>Current orders</h2>
          </div>
          <Link href="/commerce">Shop more</Link>
        </div>
        {currentOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <div className="ordersColumn">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">History</p>
            <h2>Previous orders</h2>
          </div>
        </div>
        {previousOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}

function OrderCard({ order }: { order: Order }) {
  const placedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(order.placedAt));

  return (
    <article className="orderCard">
      <div className="orderTopline">
        <div>
          <strong>{order.id}</strong>
          <span>Placed {placedDate}</span>
        </div>
        <span className="orderStatus">{order.status}</span>
      </div>
      <div className="orderProgress" aria-label={`${order.id} delivery progress`}>
        <span className="done">Ordered</span>
        <span className={order.status === "Delivered" || order.status === "Out for delivery" ? "done" : ""}>Packed</span>
        <span className={order.status === "Delivered" || order.status === "Out for delivery" ? "done" : ""}>On the way</span>
        <span className={order.status === "Delivered" ? "done" : ""}>Delivered</span>
      </div>
      <div className="orderItems">
        {order.items.map((item) => (
          <Link className="orderItem" href={`/commerce/${item.id}`} key={`${order.id}-${item.id}`}>
            <img alt={item.name} src={item.image} />
            <span>{item.name}</span>
            <small>Qty {item.quantity}</small>
          </Link>
        ))}
      </div>
      <div className="orderFooter">
        <span>{order.eta}</span>
        <strong>Rs {order.total.toLocaleString("en-IN")}</strong>
      </div>
    </article>
  );
}
