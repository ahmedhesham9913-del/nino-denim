/**
 * Migrate existing products from flat schema to variant schema.
 * Run: npx tsx --env-file=.env.local src/scripts/migrate-products.ts
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteField,
} from "firebase/firestore";

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

interface OldProduct {
  images?: string[];
  sizes?: string[];
  stock?: Record<string, number>;
  colors?: { name: string; hex: string }[];
  mainImage?: string;
  variants?: unknown[];
}

async function migrate() {
  const snapshot = await getDocs(collection(db, "products"));
  let migrated = 0;
  let skipped = 0;

  for (const d of snapshot.docs) {
    const data = d.data() as OldProduct;

    // Skip already migrated products
    if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
      skipped++;
      continue;
    }

    // Skip products without old schema fields
    if (!data.images && !data.colors) {
      skipped++;
      continue;
    }

    const images = data.images ?? [];
    const sizes = data.sizes ?? [];
    const stock = data.stock ?? {};
    const colors = data.colors ?? [{ name: "Default", hex: "#1c1917" }];

    const mainImage = images[0] ?? "";

    // Create one variant per color, each with all sizes
    const variants = colors.map((color) => ({
      colorId: "",
      colorName: color.name,
      colorHex: color.hex,
      images: images, // all colors share images in legacy data
      sizes: sizes.map((s) => ({
        value: s,
        stock: stock[s] ?? 0,
      })),
    }));

    await updateDoc(doc(db, "products", d.id), {
      mainImage,
      variants,
      // Remove old fields
      images: deleteField(),
      sizes: deleteField(),
      stock: deleteField(),
      colors: deleteField(),
    });

    migrated++;
    if (migrated % 10 === 0) console.log(`  Migrated ${migrated}...`);
  }

  console.log(`\nDone! Migrated: ${migrated}, Skipped: ${skipped}`);
  process.exit(0);
}

console.log("Migrating products to variant schema...");
migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
