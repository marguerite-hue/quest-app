import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const HUGGINGFACE_TOKEN = Deno.env.get('HUGGINGFACE_TOKEN') || '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'
// Updated to use new router endpoint (api-inference.huggingface.co is deprecated)
// The router endpoint uses /hf-inference prefix
const HUGGINGFACE_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Generating image with prompt:', prompt)

    // Call Hugging Face API
    const response = await fetch(HUGGINGFACE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Hugging Face API error: ${response.status}`
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorJson.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if response is an image
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      const text = await response.text()
      return new Response(
        JSON.stringify({ error: 'Unexpected response format', details: text }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the image blob and return it
    const imageBlob = await response.blob()
    const imageArrayBuffer = await imageBlob.arrayBuffer()

    return new Response(imageArrayBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType || 'image/png',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
