/**
 * Seed Firebase products collection with sample data.
 * Run: npx tsx src/scripts/seed.ts
 * Clean first: npx tsx src/scripts/seed.ts --clean
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
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

const images = [
  "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/17745134/pexels-photo-17745134.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/6786614/pexels-photo-6786614.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/17630811/pexels-photo-17630811.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80",
  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80",
  "https://images.pexels.com/photos/18591712/pexels-photo-18591712.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/8991032/pexels-photo-8991032.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
  "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
];

const colors = [
  { name: "Indigo", hex: "#2563eb" },
  { name: "Dark Wash", hex: "#1e293b" },
  { name: "Stone", hex: "#78716c" },
  { name: "Black", hex: "#1c1917" },
  { name: "Light Wash", hex: "#93c5fd" },
  { name: "White", hex: "#f5f5f4" },
  { name: "Grey", hex: "#6b7280" },
  { name: "Olive", hex: "#4d7c0f" },
];

const styles = [
  "Slim Fit", "Straight", "Skinny", "Relaxed", "Wide Leg",
  "Tapered", "Bootcut", "Cargo", "Flare", "High Rise", "Mom Fit", "Dad Fit",
];

const adjectives = [
  "Classic", "Modern", "Heritage", "Essential", "Premium", "Urban",
  "Vintage", "Studio", "Weekend", "Signature", "Raw", "Washed",
  "Original", "Artisan", "Street", "Coastal", "Alpine", "Eclipse",
];

const descriptions = [
  "Crafted from premium organic stretch denim with a modern fit that moves with you. Perfect for every occasion.",
  "Our most versatile pair — designed for comfort all day, styled for the streets at night.",
  "Raw selvedge denim that develops a unique fade pattern over time. Each pair tells your story.",
  "Engineered with 4-way stretch for total freedom of movement. The jeans that feel like they're not there.",
  "A timeless silhouette with modern construction. Reinforced seams and sustainable cotton blend.",
  "High-rise waist that flatters every body type. Sculpted fit without the squeeze.",
  "Relaxed through the hip with a clean taper to the ankle. Effortless style, zero compromise.",
  "Wide-leg cut inspired by vintage workwear. Heavy-weight denim that softens beautifully with wear.",
];

const tags: (string | undefined)[] = [
  "New", "Sale", "Bestseller", "Limited", "Trending",
  undefined, undefined, undefined, undefined, undefined,
];

type Category = "Men" | "Women" | "Kids" | "Unisex";
const categories: Category[] = ["Men", "Women", "Kids", "Unisex"];

const menSizes = ["28", "30", "32", "34", "36", "38"];
const womenSizes = ["24", "26", "28", "30", "32", "34"];
const kidsSizes = ["XS", "S", "M", "L", "XL"];
const unisexSizes = ["XS", "S", "M", "L", "XL", "XXL"];

function getSizes(category: Category) {
  switch (category) {
    case "Men": return menSizes;
    case "Women": return womenSizes;
    case "Kids": return kidsSizes;
    case "Unisex": return unisexSizes;
  }
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function pickN<T>(arr: T[], n: number, seed: number): T[] {
  const shuffled = [...arr].sort((a, b) => {
    const ha = Math.sin(seed + arr.indexOf(a)) * 10000;
    const hb = Math.sin(seed + arr.indexOf(b)) * 10000;
    return (ha - Math.floor(ha)) - (hb - Math.floor(hb));
  });
  return shuffled.slice(0, n);
}

function generateStock(sizes: string[], seed: number): Record<string, number> {
  const stock: Record<string, number> = {};
  sizes.forEach((s, i) => {
    const val = Math.floor(Math.abs(Math.sin(seed + i * 7) * 30));
    // ~20% chance a size is out of stock
    stock[s] = Math.abs(Math.sin(seed + i * 13)) < 0.2 ? 0 : val;
  });
  return stock;
}

function generateProducts(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const s = id * 7;
    const category = categories[i % 4];
    const style = pick(styles, s + 1);
    const adj = pick(adjectives, s + 2);
    const basePrice = 49 + Math.floor(Math.abs(Math.sin(s + 3)) * 110);
    const hasDiscount = Math.abs(Math.sin(s + 4)) > 0.5;
    const discount = hasDiscount ? Math.floor(basePrice * (0.15 + Math.abs(Math.sin(s + 5)) * 0.25)) : 0;
    const numColors = 2 + Math.floor(Math.abs(Math.sin(s + 6)) * 3);
    const productColors = pickN(colors, numColors, s + 7);
    const sizes = getSizes(category);
    const numImages = 2 + Math.floor(Math.abs(Math.sin(s + 11)) * 3);
    const productImages = pickN(images, numImages, s + 12);

    return {
      name: `${adj} ${style}`,
      description: pick(descriptions, s + 8),
      price: basePrice - discount,
      originalPrice: basePrice,
      images: productImages,
      sizes,
      stock: generateStock(sizes, s + 9),
      colors: productColors,
      category,
      style,
      tag: pick(tags, s + 10) || null,
      rating: +(3.5 + Math.abs(Math.sin(s + 13)) * 1.5).toFixed(1),
      reviews: 5 + Math.floor(Math.abs(Math.sin(s + 14)) * 280),
      created_at: Timestamp.now(),
    };
  });
}

async function cleanCollection() {
  console.log("Cleaning products collection...");
  const snapshot = await getDocs(collection(db, "products"));
  let count = 0;
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, "products", d.id));
    count++;
  }
  console.log(`Deleted ${count} products.`);
}

async function seed() {
  const shouldClean = process.argv.includes("--clean");
  if (shouldClean) {
    await cleanCollection();
  }

  const products = generateProducts(30);
  console.log(`Seeding ${products.length} products...`);

  let count = 0;
  for (const product of products) {
    await addDoc(collection(db, "products"), product);
    count++;
    if (count % 10 === 0) console.log(`  ${count}/${products.length}`);
  }

  console.log(`Done! Seeded ${count} products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
