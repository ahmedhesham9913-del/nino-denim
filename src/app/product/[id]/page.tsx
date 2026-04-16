import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductById } from "@/services/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import SkeletonProductDetail from "@/components/SkeletonProductDetail";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Product Not Found | NINO JEANS" };
  }

  return {
    title: `${product.name} | NINO JEANS`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const rawProduct = await getProductById(id);

  if (!rawProduct) {
    notFound();
  }

  // Serialize Firestore Timestamps for client component
  const product = {
    ...rawProduct,
    created_at: JSON.parse(JSON.stringify(rawProduct.created_at)),
  };

  return (
    <>
      <Suspense fallback={<SkeletonProductDetail />}>
        <ProductDetailClient product={product} />
      </Suspense>
      <Footer />
    </>
  );
}
