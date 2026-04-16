"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    document.title = "Checkout | NINO JEANS";
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  // Don't render checkout form while redirecting on empty cart
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <main className="min-h-screen pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Page header */}
          <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold tracking-[0.1em] text-nino-950 text-center mb-10">
            CHECKOUT
          </h1>

          <CheckoutForm />
        </div>
      </main>

      <Footer />
    </>
  );
}
