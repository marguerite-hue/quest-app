# Generate Avatar Edge Function

This Edge Function acts as a proxy to the Hugging Face API, solving CORS issues.

## Deployment

### Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Edge Functions** in the left sidebar
4. Click **Create a new function**
5. Name: `generate-avatar`
6. Copy the code from `index.ts` and paste it
7. Add secret: `HUGGINGFACE_TOKEN` = your Hugging Face token (never commit it; use `supabase secrets set HUGGINGFACE_TOKEN=...`)
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

Response: PNG image blob
