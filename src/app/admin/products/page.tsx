"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/services/products";
import { deleteDoc, doc, db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";
import AdminTable from "@/components/admin/AdminTable";
import ProductFilterBar from "@/components/admin/ProductFilterBar";

const PAGE_SIZE = 100;

// ─── Helpers that handle both old and new schema ────────────────

function getProductImage(product: Product): string | undefined {
  // New schema: mainImage
  if (product.mainImage) return product.mainImage;
  // Old schema fallback: images array
  const legacy = product as Product & { images?: string[] };
  return legacy.images?.[0];
}

function getTotalStock(product: Product): number {
  // New schema: sum across variants
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce(
      (sum, v) => sum + v.sizes.reduce((s, sz) => s + sz.stock, 0),
      0
    );
  }
  // Old schema fallback: stock record
  const legacy = product as Product & { stock?: Record<string, number> };
  if (legacy.stock) {
    return Object.values(legacy.stock).reduce((sum, qty) => sum + qty, 0);
  }
  return 0;
}

function getColorHexes(product: Product): string[] {
  // New schema
  if (product.variants && product.variants.length > 0) {
    return product.variants.map((v) => v.colorHex);
  }
  // Old schema fallback
  const legacy = product as Product & { colors?: { name: string; hex: string }[] };
  if (legacy.colors) {
    return legacy.colors.map((c) => c.hex);
  }
  return [];
}

function getStockColor(total: number): string {
  if (total === 0) return "text-red-600 bg-red-50";
  if (total <= 10) return "text-yellow-700 bg-yellow-50";
  return "text-green-700 bg-green-50";
}

// ─── Page component ─────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    style: "",
    tag: "",
    stockStatus: "",
  });

  const fetchProducts = useCallback(async (cursor?: DocumentSnapshot | null) => {
    setLoading(true);
    try {
      const result = await getProducts({
        pageSize: PAGE_SIZE,
        lastDoc: cursor ?? undefined,
      });
      setProducts(result.items);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleDelete(product: Product) {
    if (!product.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "products", product.id));
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search by name
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!product.name.toLowerCase().includes(searchLower)) return false;
      }
      // Category
      if (filters.category && product.category !== filters.category) return false;
      // Style
      if (filters.style && product.style !== filters.style) return false;
      // Tag
      if (filters.tag && product.tag !== filters.tag) return false;
      // Stock status
      if (filters.stockStatus) {
        const total = getTotalStock(product);
        switch (filters.stockStatus) {
          case "in_stock":
            if (total <= 10) return false;
            break;
          case "low_stock":
            if (total === 0 || total > 10) return false;
            break;
          case "out_of_stock":
            if (total !== 0) return false;
            break;
        }
      }
      return true;
    });
  }, [products, filters]);

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (product: Product) => {
        const imgSrc = getProductImage(product);
        return (
          <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100 shrink-0">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                N/A
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Name",
      render: (product: Product) => (
        <span className="font-semibold text-nino-950">{product.name}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (product: Product) => (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-nino-100 text-nino-700">
          {product.category}
        </span>
      ),
    },
    {
      key: "colors",
      label: "Colors",
      render: (product: Product) => {
        const hexes = getColorHexes(product);
        if (hexes.length === 0) return <span className="text-gray-300 text-xs">--</span>;
        return (
          <div className="flex items-center gap-1">
            {hexes.map((hex, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-full border border-nino-200/30 shrink-0"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Price",
      render: (product: Product) => (
        <span className="text-sm font-body">{product.price.toLocaleString()} EGP</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (product: Product) => {
        const total = getTotalStock(product);
        return (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStockColor(total)}`}>
            {total}
          </span>
        );
      },
    },
    {
      key: "tag",
      label: "Tag",
      render: (product: Product) =>
        product.tag ? (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-nino-50 text-nino-600">
            {product.tag}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">--</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="text-sm text-nino-600 hover:text-nino-700 font-medium transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(product);
            }}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display text-nino-950">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-nino-600 text-white text-sm font-medium font-body rounded-lg hover:bg-nino-700 transition-colors"
        >
          Add Product
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="mb-4">
        <ProductFilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={filteredProducts}
        loading={loading}
        emptyMessage="No products found. Add your first product to get started."
        onRowClick={(product: Product) => {
          window.location.href = `/admin/products/${product.id}/edit`;
        }}
        pagination={{
          page,
          hasMore,
          onNext: () => {
            if (hasMore && lastDoc) {
              setPage((p) => p + 1);
              fetchProducts(lastDoc);
            }
          },
          onPrev: () => {
            if (page > 1) {
              setPage(1);
              fetchProducts();
            }
          },
        }}
      />
    </div>
  );
}
