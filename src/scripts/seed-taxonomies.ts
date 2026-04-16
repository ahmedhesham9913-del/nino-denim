/**
 * Seed Firestore taxonomy collections with default values.
 * Run: npx tsx --env-file=.env.local src/scripts/seed-taxonomies.ts
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = {
  colors: [
    { name: "Indigo", hex: "#2563eb", order: 0 },
    { name: "Dark Wash", hex: "#1e293b", order: 1 },
    { name: "Stone", hex: "#78716c", order: 2 },
    { name: "Black", hex: "#1c1917", order: 3 },
    { name: "Light Wash", hex: "#93c5fd", order: 4 },
    { name: "White", hex: "#f5f5f4", order: 5 },
    { name: "Grey", hex: "#6b7280", order: 6 },
    { name: "Olive", hex: "#4d7c0f", order: 7 },
  ],
  categories: [
    { name: "Men", slug: "men", order: 0 },
    { name: "Women", slug: "women", order: 1 },
    { name: "Kids", slug: "kids", order: 2 },
    { name: "Unisex", slug: "unisex", order: 3 },
  ],
  tags: [
    { name: "New", color: "#2563eb", order: 0 },
    { name: "Sale", color: "#ef4444", order: 1 },
    { name: "Bestseller", color: "#f59e0b", order: 2 },
    { name: "Limited", color: "#1c1917", order: 3 },
    { name: "Trending", color: "#a855f7", order: 4 },
  ],
  sizes: [
    // Men
    { value: "28", group: "Men", order: 0 },
    { value: "30", group: "Men", order: 1 },
    { value: "32", group: "Men", order: 2 },
    { value: "34", group: "Men", order: 3 },
    { value: "36", group: "Men", order: 4 },
    { value: "38", group: "Men", order: 5 },
    // Women
    { value: "24", group: "Women", order: 0 },
    { value: "26", group: "Women", order: 1 },
    { value: "28", group: "Women", order: 2 },
    { value: "30", group: "Women", order: 3 },
    { value: "32", group: "Women", order: 4 },
    { value: "34", group: "Women", order: 5 },
    // Kids
    { value: "XS", group: "Kids", order: 0 },
    { value: "S", group: "Kids", order: 1 },
    { value: "M", group: "Kids", order: 2 },
    { value: "L", group: "Kids", order: 3 },
    { value: "XL", group: "Kids", order: 4 },
    // Unisex
    { value: "XS", group: "Unisex", order: 0 },
    { value: "S", group: "Unisex", order: 1 },
    { value: "M", group: "Unisex", order: 2 },
    { value: "L", group: "Unisex", order: 3 },
    { value: "XL", group: "Unisex", order: 4 },
    { value: "XXL", group: "Unisex", order: 5 },
  ],
  payment_methods: [
    { name: "Cash on Delivery", enabled: true, icon: "💵", order: 0 },
    { name: "Credit Card", enabled: false, icon: "💳", order: 1 },
    { name: "Bank Transfer", enabled: false, icon: "🏦", order: 2 },
    { name: "Paymob", enabled: false, icon: "📱", order: 3 },
  ],
  styles: [
    { name: "Slim Fit", order: 0 },
    { name: "Straight", order: 1 },
    { name: "Skinny", order: 2 },
    { name: "Relaxed", order: 3 },
    { name: "Wide Leg", order: 4 },
    { name: "Tapered", order: 5 },
    { name: "Bootcut", order: 6 },
    { name: "Cargo", order: 7 },
    { name: "Flare", order: 8 },
    { name: "High Rise", order: 9 },
    { name: "Mom Fit", order: 10 },
    { name: "Dad Fit", order: 11 },
  ],
};

async function seed() {
  for (const [taxonomy, items] of Object.entries(seedData)) {
    const existing = await getDocs(collection(db, taxonomy));
    if (existing.docs.length > 0) {
      console.log(`${taxonomy}: ${existing.docs.length} items already exist. Skipping.`);
      continue;
    }

    console.log(`Seeding ${taxonomy}...`);
    for (const item of items) {
      await addDoc(collection(db, taxonomy), item);
    }
    console.log(`  Added ${items.length} ${taxonomy}`);
  }

  console.log("\nDone! All taxonomies seeded.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
