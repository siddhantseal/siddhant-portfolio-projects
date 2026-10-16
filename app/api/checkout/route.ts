import { NextResponse } from "next/server";
import { products } from "@/lib/data";

type CheckoutItem = {
  id: string;
  quantity: number;
};

type DeliveryAddress = {
  fullName?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    items?: CheckoutItem[];
    address?: DeliveryAddress;
    deliverySlot?: string;
    paymentMethod?: string;
    paymentTime?: string;
  };
  const items = body.items ?? [];

  if (!items.length) {
    return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const delivery = subtotal > 5000 ? 0 : 149;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + delivery + tax;

  return NextResponse.json({
    orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
    status: "payment_confirmed",
    subtotal,
    delivery,
    tax,
    total,
    address: body.address ?? null,
    deliverySlot: body.deliverySlot ?? null,
    paymentMethod: body.paymentMethod ?? null,
    paymentTime: body.paymentTime ?? null
  });
}
