/**
 * Create admin user in Firebase Auth.
 * Run: npx tsx --env-file=.env.local src/scripts/create-admin.ts
 */
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdmin() {
  const email = "hesham@ninojeans.com";
  const password = "Hesham9913";
  const displayName = "Hesham";

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    console.log("Admin user created successfully!");
    console.log(`  Email: ${email}`);
    console.log(`  Display Name: ${displayName}`);
    console.log(`  UID: ${userCredential.user.uid}`);
    process.exit(0);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === "auth/email-already-in-use") {
      console.log("Admin user already exists with this email.");
      process.exit(0);
    }
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
