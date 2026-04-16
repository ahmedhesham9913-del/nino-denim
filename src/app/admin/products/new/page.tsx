"use client";

import { useRouter } from "next/navigation";
import { createProduct } from "@/services/products";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(data: Omit<Product, "id" | "created_at">) {
    await createProduct(data);
    router.push("/admin/products");
  }

  function handleCancel() {
    router.push("/admin/products");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-nino-950 mb-6">
        Add New Product
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
