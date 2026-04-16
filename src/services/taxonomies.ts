import {
  db,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "@/lib/firebase";

// ─── Type definitions ──────────────────────────────────────────────

export interface ColorItem {
  id?: string;
  name: string;
  hex: string;
  order?: number;
}

export interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
  order?: number;
}

export interface TagItem {
  id?: string;
  name: string;
  color: string; // hex for the badge background
  order?: number;
}

export interface SizeItem {
  id?: string;
  value: string;
  group: "Men" | "Women" | "Kids" | "Unisex";
  order?: number;
}

export interface PaymentMethodItem {
  id?: string;
  name: string;
  enabled: boolean;
  icon?: string; // emoji or icon identifier
  order?: number;
}

export interface StyleItem {
  id?: string;
  name: string;
  order?: number;
}

export type TaxonomyName =
  | "colors"
  | "categories"
  | "tags"
  | "sizes"
  | "payment_methods"
  | "styles";

// ─── Generic CRUD ──────────────────────────────────────────────────

export async function getTaxonomyItems<T>(
  taxonomy: TaxonomyName
): Promise<T[]> {
  const q = query(collection(db, taxonomy), orderBy("order", "asc"));
  let snapshot;
  try {
    snapshot = await getDocs(q);
  } catch {
    // If order field doesn't exist, fall back to no ordering
    snapshot = await getDocs(collection(db, taxonomy));
  }
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
}

export async function addTaxonomyItem<T extends Record<string, unknown>>(
  taxonomy: TaxonomyName,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, taxonomy), data);
  return docRef.id;
}

export async function updateTaxonomyItem(
  taxonomy: TaxonomyName,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(db, taxonomy, id), data);
}

export async function deleteTaxonomyItem(
  taxonomy: TaxonomyName,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, taxonomy, id));
}
