# Generate Avatar Edge Function

This Edge Function acts as a proxy to Cloudflare Workers AI (FLUX.1 schnell, free daily allowance), solving CORS issues.

## Deployment

### Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Edge Functions** in the left sidebar
4. Click **Create a new function**
5. Name: `generate-avatar`
6. Copy the code from `index.ts` and paste it
7. Add secrets: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (token with Workers AI permission; never commit them)
8. Click **Deploy**

### Via CLI

```bash
supabase functions deploy generate-avatar --project-ref uxgejvkoevtexfquafgg
```

## Usage

The function will be available at:
`https://uxgejvkoevtexfquafgg.supabase.co/functions/v1/generate-avatar`

POST request body:
```json
{
  "prompt": "avatar portrait in Sims style, fashionable young adult with curly hair, profile picture, high quality, detailed, centered face"
}
```

Response: JPEG image blob. When the free daily allowance is used up it returns a 429 with a JSON `error` message (resets at 00:00 UTC).
