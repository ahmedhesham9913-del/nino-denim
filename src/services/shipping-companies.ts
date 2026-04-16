import {
  db,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "@/lib/firebase";
import type { ShippingCompany } from "@/lib/types";

const COLLECTION = "shipping_companies";

export async function getShippingCompanies(): Promise<ShippingCompany[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ShippingCompany[];
}

export async function getEnabledShippingCompanies(): Promise<ShippingCompany[]> {
  const q = query(collection(db, COLLECTION), where("enabled", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ShippingCompany[];
}

export async function addShippingCompany(
  data: Omit<ShippingCompany, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateShippingCompany(
  id: string,
  data: Partial<Omit<ShippingCompany, "id">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteShippingCompany(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
