import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN')
// FLUX.1 schnell on Cloudflare Workers AI: free daily allowance, prompt limited to 2048 characters.
const CLOUDFLARE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`
const MAX_PROMPT_LENGTH = 2048

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const jsonError = (error: string, status: number, details?: string) =>
  new Response(JSON.stringify({ error, details }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return jsonError('Cloudflare credentials are not configured', 500)
    }

    const { prompt } = await req.json()

    if (!prompt) {
      return jsonError('Prompt is required', 400)
    }

    console.log('Generating image with prompt:', prompt)

    const response = await fetch(CLOUDFLARE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: String(prompt).slice(0, MAX_PROMPT_LENGTH), steps: 4 }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok || data?.success === false) {
      const cfMessage = data?.errors?.[0]?.message
      // Free allowance used up: Cloudflare returns errors until the daily reset (00:00 UTC)
      const quotaReached = response.status === 429 || /neurons|quota|limit/i.test(cfMessage || '')
      return jsonError(
        quotaReached
          ? "La limite d'images gratuites du jour est atteinte, réessaie demain."
          : cfMessage || `Cloudflare API error: ${response.status}`,
        quotaReached ? 429 : response.status || 500,
        cfMessage
      )
    }

    // Cloudflare REST wraps the output in `result`; the model returns the image as base64
    const base64Image = data?.result?.image ?? data?.image
    if (!base64Image) {
      return jsonError('Unexpected response format', 500, JSON.stringify(data)?.slice(0, 300))
    }

    const bytes = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0))

    return new Response(bytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return jsonError(error.message || 'Internal server error', 500)
  }
})
