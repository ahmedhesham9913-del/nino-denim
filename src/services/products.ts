import {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from "@/lib/firebase";
import type {
  Product,
  PaginatedResult,
} from "@/lib/types";
import type { DocumentSnapshot, QueryConstraint } from "firebase/firestore";

const COLLECTION = "products";
const DEFAULT_PAGE_SIZE = 12;

export type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

function getSortConfig(sortBy: SortOption): { field: string; direction: "asc" | "desc" } {
  switch (sortBy) {
    case "price-asc": return { field: "price", direction: "asc" };
    case "price-desc": return { field: "price", direction: "desc" };
    case "popular": return { field: "reviews", direction: "desc" };
    default: return { field: "created_at", direction: "desc" };
  }
}

export async function getProducts(options: {
  pageSize?: number;
  lastDoc?: DocumentSnapshot | null;
  category?: string;
  sortBy?: SortOption;
} = {}): Promise<PaginatedResult<Product>> {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    lastDoc = null,
    category,
    sortBy = "newest",
  } = options;

  const { field, direction } = getSortConfig(sortBy);
  const constraints: QueryConstraint[] = [];

  if (category) {
    constraints.push(where("category", "==", category));
  }

  constraints.push(orderBy(field, direction));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  // Fetch one extra to determine hasMore
  constraints.push(limit(pageSize + 1));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  const hasMore = snapshot.docs.length > pageSize;
  const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  const items: Product[] = docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Product[];

  return {
    items,
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function createProduct(
  data: Omit<Product, "id" | "created_at">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "created_at">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { deleteDoc: firestoreDeleteDoc } = await import("firebase/firestore");
  await firestoreDeleteDoc(doc(db, COLLECTION, id));
}
