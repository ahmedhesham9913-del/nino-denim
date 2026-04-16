"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProductById, updateProduct } from "@/services/products";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      setLoading(true);
      try {
        const result = await getProductById(id);
        if (!result) {
          setNotFound(true);
        } else {
          setProduct(result);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function handleSubmit(data: Omit<Product, "id" | "created_at">) {
    await updateProduct(id, data);
    router.push("/admin/products");
  }

  function handleCancel() {
    router.push("/admin/products");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-nino-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-display font-bold text-nino-950 mb-2">Product Not Found</h2>
        <p className="text-gray-500 font-body mb-4">
          The product you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 bg-nino-950 text-white text-sm font-medium font-body rounded-lg hover:bg-nino-900 transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-nino-950 mb-6">
        Edit Product
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm
          product={product!}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
