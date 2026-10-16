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
  cancelReason?: string;
  cancelledAt?: string;
};

const cancelReasons = [
  "Ordered by mistake",
  "Found a better price",
  "Delivery will take too long",
  "Need to change address or product",
  "Payment issue",
  "Other reason"
];

export const sampleOrders: Order[] = [
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
  const [sampleOrderOverrides, setSampleOrderOverrides] = useState<Record<string, Partial<Order>>>({});
  const [cancelOrderId, setCancelOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState(cancelReasons[0]);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    try {
      setSavedOrders(JSON.parse(window.localStorage.getItem("sealcart-orders") ?? "[]"));
      setSampleOrderOverrides(JSON.parse(window.localStorage.getItem("sealcart-sample-order-overrides") ?? "{}"));
    } catch {
      setSavedOrders([]);
      setSampleOrderOverrides({});
    }
  }, []);

  const orders = useMemo(
    () => [
      ...savedOrders,
      ...sampleOrders.map((order) => ({ ...order, ...sampleOrderOverrides[order.id] }))
    ],
    [savedOrders, sampleOrderOverrides]
  );
  const currentOrders = orders.filter((order) => order.status !== "Delivered" && order.status !== "Cancelled");
  const previousOrders = orders.filter((order) => order.status === "Delivered" || order.status === "Cancelled");
  const cancelledOrders = orders.filter((order) => order.status === "Cancelled");

  function startCancel(orderId: string) {
    setCancelOrderId(orderId);
    setCancelReason(cancelReasons[0]);
    setActionMessage("");
  }

  function confirmCancel(order: Order) {
    const trimmedReason = cancelReason.trim();

    if (!trimmedReason) {
      setActionMessage("Please select or type a cancellation reason.");
      return;
    }

    const cancelledOrder: Order = {
      ...order,
      status: "Cancelled",
      eta: "Cancelled by customer",
      cancelReason: trimmedReason,
      cancelledAt: new Date().toISOString()
    };

    if (savedOrders.some((savedOrder) => savedOrder.id === order.id)) {
      const nextSavedOrders = savedOrders.map((savedOrder) => (
        savedOrder.id === order.id ? cancelledOrder : savedOrder
      ));
      setSavedOrders(nextSavedOrders);
      window.localStorage.setItem("sealcart-orders", JSON.stringify(nextSavedOrders));
    } else {
      const nextOverrides = {
        ...sampleOrderOverrides,
        [order.id]: {
          status: cancelledOrder.status,
          eta: cancelledOrder.eta,
          cancelReason: cancelledOrder.cancelReason,
          cancelledAt: cancelledOrder.cancelledAt
        }
      };
      setSampleOrderOverrides(nextOverrides);
      window.localStorage.setItem("sealcart-sample-order-overrides", JSON.stringify(nextOverrides));
    }

    setCancelOrderId("");
    setActionMessage(`Order ${order.id} cancelled. Reason saved to your order history.`);
  }

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
          <span>Cancelled</span>
          <strong>{cancelledOrders.length}</strong>
        </article>
      </div>
      {actionMessage ? <p className="orderActionMessage">{actionMessage}</p> : null}

      <div className="ordersColumn">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">Coming soon</p>
            <h2>Current orders</h2>
          </div>
          <Link href="/commerce">Shop more</Link>
        </div>
        {currentOrders.map((order) => (
          <OrderCard
            cancelReason={cancelReason}
            isCanceling={cancelOrderId === order.id}
            key={order.id}
            onCancel={startCancel}
            onCancelReasonChange={setCancelReason}
            onCloseCancel={() => setCancelOrderId("")}
            onConfirmCancel={confirmCancel}
            order={order}
          />
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
          <OrderCard
            cancelReason={cancelReason}
            isCanceling={cancelOrderId === order.id}
            key={order.id}
            onCancel={startCancel}
            onCancelReasonChange={setCancelReason}
            onCloseCancel={() => setCancelOrderId("")}
            onConfirmCancel={confirmCancel}
            order={order}
          />
        ))}
      </div>
    </section>
  );
}

function OrderCard({
  cancelReason,
  isCanceling,
  onCancel,
  onCancelReasonChange,
  onCloseCancel,
  onConfirmCancel,
  order
}: {
  cancelReason: string;
  isCanceling: boolean;
  onCancel: (orderId: string) => void;
  onCancelReasonChange: (reason: string) => void;
  onCloseCancel: () => void;
  onConfirmCancel: (order: Order) => void;
  order: Order;
}) {
  const placedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(order.placedAt));
  const cancelledDate = order.cancelledAt ? new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(order.cancelledAt)) : "";
  const canCancel = order.status !== "Delivered" && order.status !== "Cancelled";

  return (
    <article className="orderCard">
      <div className="orderTopline">
        <div>
          <strong>{order.id}</strong>
          <span>Placed {placedDate}</span>
        </div>
        <span className={`orderStatus ${order.status === "Cancelled" ? "cancelled" : ""}`}>{order.status}</span>
      </div>
      <div className="orderProgress" aria-label={`${order.id} delivery progress`}>
        <span className="done">Ordered</span>
        {order.status === "Cancelled" ? (
          <>
            <span className="cancelled">Cancelled</span>
            <span>Refund</span>
            <span>Closed</span>
          </>
        ) : (
          <>
            <span className={order.status === "Delivered" || order.status === "Out for delivery" ? "done" : ""}>Packed</span>
            <span className={order.status === "Delivered" || order.status === "Out for delivery" ? "done" : ""}>On the way</span>
            <span className={order.status === "Delivered" ? "done" : ""}>Delivered</span>
          </>
        )}
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
        <div className="orderFooterActions">
          {canCancel ? (
            <button className="button secondary" onClick={() => onCancel(order.id)} type="button">
              Cancel order
            </button>
          ) : null}
          <strong>Rs {order.total.toLocaleString("en-IN")}</strong>
        </div>
      </div>
      {order.status === "Cancelled" ? (
        <div className="cancelledOrderNote">
          <strong>Cancellation reason</strong>
          <span>{order.cancelReason}</span>
          {cancelledDate ? <small>Cancelled on {cancelledDate}</small> : null}
        </div>
      ) : null}
      {isCanceling ? (
        <div className="cancelOrderBox">
          <label>
            Reason for cancellation
            <select value={cancelReason} onChange={(event) => onCancelReasonChange(event.target.value)}>
              {cancelReasons.map((reason) => <option key={reason}>{reason}</option>)}
            </select>
          </label>
          <div className="cancelOrderActions">
            <button className="button secondary" onClick={onCloseCancel} type="button">Keep order</button>
            <button className="button primary" onClick={() => onConfirmCancel(order)} type="button">Confirm cancellation</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
