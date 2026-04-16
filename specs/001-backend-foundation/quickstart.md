# Quickstart: Backend Foundation

## Prerequisites

- Node.js 20+ installed
- Access to Firebase console for `nino-denim` project
- Cloudinary account credentials
- Supabase project credentials

## Setup Steps

### 1. Install dependencies

```bash
npm install firebase cloudinary @supabase/supabase-js
```

### 2. Create environment file

Copy the example file and fill in real values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials (see `.env.local.example`
for the required variable names and descriptions).

### 3. Create Supabase events table

Run the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  text NOT NULL,
  user_id     text,
  product_id  text,
  metadata    jsonb DEFAULT '{}',
  timestamp   timestamptz DEFAULT now() NOT NULL,
  session_id  text
);

CREATE INDEX idx_events_type_ts ON events (event_type, timestamp DESC);
CREATE INDEX idx_events_product ON events (product_id, timestamp DESC);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON events FOR INSERT TO anon
  WITH CHECK (true);
CREATE POLICY "service_read" ON events FOR SELECT TO service_role
  USING (true);
```

### 4. Start development server

```bash
npm run dev
```

### 5. Verify connections

- Firebase: The app should start without Firebase initialization errors
  in the console.
- Cloudinary: Test via `POST /api/upload` with a sample image.
- Supabase: Check the `events` table in Supabase dashboard after
  triggering a test event.

## File Structure (new files)

```
src/lib/
  firebase.ts       # Firebase client singleton
  cloudinary.ts     # Cloudinary upload helper (server-only)
  supabase.ts       # Supabase client + trackEvent helper
  types.ts          # Shared TypeScript interfaces
  env.ts            # Environment variable validation

src/app/api/
  upload/route.ts   # Image upload API route

.env.local          # Credentials (git-ignored)
.env.local.example  # Template with placeholder descriptions
```
