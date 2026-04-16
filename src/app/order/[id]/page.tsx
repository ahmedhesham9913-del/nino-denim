import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/services/orders";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id.slice(0, 8)} | NINO JEANS` };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  partially_returned: "bg-orange-100 text-orange-800",
  returned: "bg-rose-100 text-rose-800",
  exchanged: "bg-teal-100 text-teal-800",
};

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const statusClass = STATUS_COLORS[order.status] ?? "bg-nino-100 text-nino-800";

  return (
    <>
      <div className="min-h-screen pt-28 pb-16 px-6" style={{ background: "oklch(0.97 0.006 250)" }}>
        <div className="max-w-[700px] mx-auto">
          {/* Success header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="font-[var(--font-display)] text-3xl font-bold text-nino-950 mb-2">
              Order Confirmed
            </h1>
            <p className="text-nino-800/35 text-sm">
              Thank you for your order! Here are your details.
            </p>
          </div>

          {/* Order card */}
          <div className="rounded-2xl border border-nino-200/30 bg-white/60 overflow-hidden">
            {/* Order ID + Status */}
            <div className="p-6 border-b border-nino-200/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-nino-800/30 font-[var(--font-display)] font-medium mb-1">
                    ORDER ID
                  </p>
                  <p className="font-[var(--font-display)] font-bold text-nino-950 text-lg">
                    {order.id}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-[var(--font-display)] font-bold tracking-wider ${statusClass}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="p-6 border-b border-nino-200/20">
              <p className="text-[10px] tracking-[0.3em] text-nino-800/30 font-[var(--font-display)] font-medium mb-4">
                ITEMS
              </p>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-nino-800/60">
                      {item.name}{item.color ? ` — ${item.color}` : ""} / Size {item.size} x{item.quantity}
                    </span>
                    <span className="font-[var(--font-display)] font-semibold text-nino-950">
                      {item.unit_price * item.quantity} EGP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div className="p-6 border-b border-nino-200/20">
              <div className="flex justify-between text-sm">
                <span className="text-nino-800/40">
                  Delivery — {order.delivery_zone}
                </span>
                <span className="font-[var(--font-display)] font-semibold text-nino-950">
                  {order.delivery_fee} EGP
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="p-6 border-b border-nino-200/20">
              <div className="flex justify-between">
                <span className="font-[var(--font-display)] font-semibold text-nino-950">
                  Total
                </span>
                <span className="font-[var(--font-display)] text-xl font-bold text-nino-950">
                  {order.total_price} EGP
                </span>
              </div>
              <p className="text-[11px] text-nino-800/25 mt-1 text-right font-[var(--font-display)]">
                Cash on Delivery
              </p>
            </div>

            {/* Customer info */}
            <div className="p-6">
              <p className="text-[10px] tracking-[0.3em] text-nino-800/30 font-[var(--font-display)] font-medium mb-3">
                DELIVERY TO
              </p>
              <p className="text-sm text-nino-950 font-medium">{order.customer.name}</p>
              <p className="text-sm text-nino-800/40">{order.customer.phone}</p>
              <p className="text-sm text-nino-800/40">{order.customer.address}</p>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="p-6 border-t border-nino-200/20">
                <p className="text-[10px] tracking-[0.3em] text-nino-800/30 font-[var(--font-display)] font-medium mb-2">
                  YOUR NOTES
                </p>
                <p className="text-sm text-nino-800/50 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-block px-8 py-3.5 rounded-full font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-white"
              style={{ background: "oklch(0.48 0.16 240)" }}
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
