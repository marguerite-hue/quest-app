/**
 * Script to upload the quest book image to Supabase Storage
 * 
 * Usage:
 *   node scripts/upload-quest-book.js [path-to-image]
 * 
 * Example:
 *   node scripts/upload-quest-book.js src/assets/illustrations/carnet-quetes.png
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })
config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uxgejvkoevtexfquafgg.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY not found in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadQuestBook(imagePath) {
  try {
    console.log('📤 Uploading quest book image to Supabase Storage...')
    console.log(`   Image path: ${imagePath}`)

    // Read the image file
    const imageBuffer = readFileSync(imagePath)
    const fileName = 'carnet-quetes.png'
    const storagePath = `illustrations/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('game-assets')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true, // Overwrite if exists
      })

    if (error) {
      if (error.message.includes('Bucket not found')) {
        console.error('❌ Error: Bucket "game-assets" not found!')
        console.error('   Please run: npm run setup:assets')
        console.error('   Or run supabase/migrations/20260112112930_create_game_assets_bucket.sql in Supabase SQL Editor')
        process.exit(1)
      }
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('game-assets')
      .getPublicUrl(storagePath)

    console.log('✅ Upload successful!')
    console.log(`   Public URL: ${urlData.publicUrl}`)
    console.log('')
    console.log('📝 Next steps:')
    console.log('   1. The image is now available at the URL above')
    console.log('   2. The code will automatically use this URL')
    console.log('   3. All users will be able to see the quest book image!')

    return urlData.publicUrl
  } catch (error) {
    console.error('❌ Error uploading image:', error.message)
    process.exit(1)
  }
}

// Get image path from command line or use default
const imagePath = process.argv[2] || resolve(__dirname, '../src/assets/illustrations/carnet-quetes.png')

uploadQuestBook(imagePath)
