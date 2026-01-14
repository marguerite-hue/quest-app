# Deploy Edge Function to Fix CORS Issue

The avatar generation is currently failing due to CORS (Cross-Origin Resource Sharing) restrictions. To fix this, you need to deploy the Supabase Edge Function.

## Option 1: Deploy via Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Create a new function**
4. Name it: `generate-avatar`
5. Copy and paste the code from `supabase/functions/generate-avatar/index.ts`
6. Click **Deploy**

## Option 2: Deploy via CLI (Requires Docker)

1. Make sure Docker is running
2. Run: `supabase functions deploy generate-avatar`

## After Deployment

Once deployed, the Edge Function will act as a proxy and handle CORS properly. The avatar generation should work without "failed to fetch" errors.

The function URL will be: `https://uxgejvkoevtexfquafgg.supabase.co/functions/v1/generate-avatar`
