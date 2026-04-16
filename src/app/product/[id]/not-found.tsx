import Link from "next/link";
import Footer from "@/components/Footer";

export default function ProductNotFound() {
  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "oklch(0.97 0.006 250)" }}
      >
        <div className="text-center">
          <div className="font-[var(--font-display)] text-[8rem] font-black text-nino-200/30 leading-none mb-4">
            404
          </div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold text-nino-950 mb-3">
            Product Not Found
          </h1>
          <p className="text-nino-800/35 mb-8 max-w-sm mx-auto">
            The product you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 rounded-full font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-white"
            style={{ background: "oklch(0.48 0.16 240)" }}
          >
            BACK TO SHOP
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
