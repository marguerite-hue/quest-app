# Deploy Edge Function - Quick Guide

## Step-by-Step Deployment (Takes 2 minutes)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `uxgejvkoevtexfquafgg`

2. **Create Edge Function**
   - Click **Edge Functions** in left sidebar
   - Click **"Create a new function"** button
   - Function name: `generate-avatar`
   - Click **Create function**

3. **Paste the Code**
   - Open: `supabase/functions/generate-avatar/index.ts`
   - Copy ALL the code
   - Paste it into the Supabase editor

4. **Add Secret (Important!)**
   - In the function editor, look for **"Secrets"** section
   - Click **"Add secret"**
   - Name: `HUGGINGFACE_TOKEN`
   - Value: `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`
   - Click **Save**

5. **Deploy**
   - Click **"Deploy"** button
   - Wait for deployment to complete (usually 10-30 seconds)

6. **Test**
   - Go back to your app
   - Try generating an avatar
   - It should work now! ✨

## That's it!

Once deployed, the function will be available at:
`https://uxgejvkoevtexfquafgg.supabase.co/functions/v1/generate-avatar`

The app will automatically use it and CORS issues will be resolved.
