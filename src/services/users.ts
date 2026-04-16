import {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  arrayUnion,
} from "@/lib/firebase";
import type { User, PaginatedResult } from "@/lib/types";
import type { DocumentSnapshot, QueryConstraint } from "firebase/firestore";

const COLLECTION = "users";

export async function createUser(
  data: { name: string; email: string; phone: string; address?: string }
): Promise<string> {
  // Check phone uniqueness if provided
  if (data.phone) {
    const existingByPhone = await getUserByPhone(data.phone);
    if (existingByPhone) {
      throw new Error(`User with phone "${data.phone}" already exists`);
    }
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    orders: [],
    total_spent: 0,
    order_count: 0,
    delivered_count: 0,
    cancelled_count: 0,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function getUserByPhone(
  phone: string
): Promise<User | null> {
  const q = query(
    collection(db, COLLECTION),
    where("phone", "==", phone),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as User;
}

export async function getUserByEmail(
  email: string
): Promise<User | null> {
  const q = query(
    collection(db, COLLECTION),
    where("email", "==", email),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as User;
}

export async function getUserById(
  id: string
): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
}

export async function addOrderToUser(
  userId: string,
  orderId: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, userId), {
    orders: arrayUnion(orderId),
  });
}

const DEFAULT_PAGE_SIZE = 20;

export async function getUsers(
  options: {
    pageSize?: number;
    lastDoc?: DocumentSnapshot | null;
  } = {}
): Promise<PaginatedResult<User>> {
  const { pageSize = DEFAULT_PAGE_SIZE, lastDoc = null } = options;

  const constraints: QueryConstraint[] = [];
  constraints.push(orderBy("created_at", "desc"));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(pageSize + 1));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  const hasMore = snapshot.docs.length > pageSize;
  const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  const items: User[] = docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as User[];

  return {
    items,
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
}

export async function updateUser(
  id: string,
  data: Partial<Omit<User, "id" | "created_at" | "orders">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
