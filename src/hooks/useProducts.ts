"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getProducts, type SortOption } from "@/services/products";
import type { Product, ProductCategory } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";

interface UseProductsOptions {
  category?: ProductCategory;
  sortBy?: SortOption;
  pageSize?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { category, sortBy = "newest", pageSize = 12 } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const isLoadingMore = useRef(false);

  // Fetch first page when category or sort changes
  useEffect(() => {
    let cancelled = false;

    async function fetchFirst() {
      setLoading(true);
      setError(null);
      lastDocRef.current = null;

      try {
        const result = await getProducts({
          pageSize,
          category,
          sortBy,
        });

        if (!cancelled) {
          setProducts(result.items);
          lastDocRef.current = result.lastDoc;
          setHasMore(result.hasMore);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFirst();
    return () => { cancelled = true; };
  }, [category, sortBy, pageSize]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore.current || !hasMore) return;
    isLoadingMore.current = true;

    try {
      const result = await getProducts({
        pageSize,
        lastDoc: lastDocRef.current,
        category,
        sortBy,
      });

      setProducts((prev) => [...prev, ...result.items]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more products");
    } finally {
      isLoadingMore.current = false;
    }
  }, [hasMore, pageSize, category, sortBy]);

  const reset = useCallback(() => {
    setProducts([]);
    setLoading(true);
    setError(null);
    setHasMore(false);
    lastDocRef.current = null;
  }, []);

  return { products, loading, error, hasMore, loadMore, reset };
}
