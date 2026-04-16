import {
  db,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "@/lib/firebase";
import type { DeliveryZone } from "@/lib/types";

const COLLECTION = "delivery_zones";

export interface FirestoreDeliveryZone extends DeliveryZone {
  id: string;
}

export async function getZones(): Promise<FirestoreDeliveryZone[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as FirestoreDeliveryZone[];
}

export async function addZone(zone: {
  name: string;
  fee: number;
  governorates?: string[];
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), zone);
  return docRef.id;
}

export async function updateZone(
  id: string,
  data: { name?: string; fee?: number; governorates?: string[] }
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteZone(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
