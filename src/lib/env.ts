// Next.js inlines NEXT_PUBLIC_* via direct property access only.
// Dynamic access like process.env[key] does NOT work on the client.
// So we build the env object with direct references and validate after.

export const env = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
} as const;

// Validate on server only (client values are inlined at build time)
if (typeof window === "undefined") {
  const missing: string[] = [];
  if (!env.firebase.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!env.firebase.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!env.firebase.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!env.firebase.storageBucket) missing.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!env.firebase.messagingSenderId) missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!env.firebase.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  if (!env.supabase.url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabase.anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing public environment variables:\n` +
        missing.map((k) => `  - ${k}`).join("\n") +
        "\n\nCopy .env.local.example to .env.local and fill in the values."
    );
  }
}

// Server-only env — call this in API routes / server components only
export function getServerEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";

  const missing: string[] = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing server-only environment variables:\n` +
        missing.map((k) => `  - ${k}`).join("\n")
    );
  }

  return {
    cloudinary: { cloudName, apiKey, apiSecret },
  } as const;
}
