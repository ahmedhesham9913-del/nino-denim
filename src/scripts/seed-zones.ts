/**
 * Seed Firestore delivery_zones collection with default zones.
 * Run: npx tsx --env-file=.env.local src/scripts/seed-zones.ts
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

const defaultZones = [
  { name: "Cairo", fee: 30 },
  { name: "Giza / Alexandria", fee: 50 },
  { name: "Other Governorates", fee: 80 },
];

async function seed() {
  const existing = await getDocs(collection(db, "delivery_zones"));
  if (existing.docs.length > 0) {
    console.log(`delivery_zones already has ${existing.docs.length} zones. Skipping seed.`);
    process.exit(0);
  }

  console.log("Seeding delivery zones...");
  for (const zone of defaultZones) {
    await addDoc(collection(db, "delivery_zones"), zone);
    console.log(`  Added: ${zone.name} — ${zone.fee} EGP`);
  }
  console.log("Done! Seeded 3 delivery zones.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
