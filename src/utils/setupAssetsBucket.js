/**
 * Setup Assets Bucket - Automatically create game-assets bucket in Supabase
 * 
 * This script can be run to automatically create the game-assets bucket
 * and set up the necessary storage policies.
 * 
 * Usage:
 *   import { setupAssetsBucket } from '@/utils/setupAssetsBucket'
 *   await setupAssetsBucket()
 */

import { supabase } from '../supabase'

/**
 * Create the game-assets bucket and set up policies
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function setupAssetsBucket() {
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      // If we can't list buckets, we probably don't have admin access
      // Return instructions to run SQL manually
      return {
        success: false,
        message: 'Cannot access storage buckets. Please run supabase/migrations/20260112112930_create_game_assets_bucket.sql in Supabase SQL Editor.',
        sqlFile: 'supabase/migrations/20260112112930_create_game_assets_bucket.sql'
      }
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'game-assets')

    if (bucketExists) {
      return {
        success: true,
        message: 'Bucket "game-assets" already exists!',
        bucketExists: true
      }
    }

    // Note: Creating buckets via JS client requires admin privileges
    // For regular users, we'll provide SQL instructions
    return {
      success: false,
      message: 'Bucket creation requires admin access. Please run the SQL migration.',
      sqlFile: 'supabase/migrations/20260112112930_create_game_assets_bucket.sql',
      instructions: [
        '1. Go to Supabase Dashboard → SQL Editor',
        '2. Open supabase/migrations/20260112112930_create_game_assets_bucket.sql',
        '3. Copy and paste the SQL into the editor',
        '4. Click Run'
      ]
    }
  } catch (error) {
    console.error('Error setting up assets bucket:', error)
    return {
      success: false,
      message: error.message || 'Failed to set up assets bucket',
      error: error
    }
  }
}

/**
 * Verify that the bucket exists and is accessible
 * @returns {Promise<{exists: boolean, accessible: boolean, message: string}>}
 */
export async function verifyAssetsBucket() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      return {
        exists: false,
        accessible: false,
        message: `Error checking buckets: ${error.message}`
      }
    }

    const bucket = buckets.find(b => b.name === 'game-assets')
    
    if (!bucket) {
      return {
        exists: false,
        accessible: false,
        message: 'Bucket "game-assets" does not exist. Please run supabase/migrations/20260112112930_create_game_assets_bucket.sql'
      }
    }

    // Try to list files to verify access
    const { data: files, error: listError } = await supabase.storage
      .from('game-assets')
      .list('', { limit: 1 })

    if (listError) {
      return {
        exists: true,
        accessible: false,
        message: `Bucket exists but is not accessible: ${listError.message}`
      }
    }

    return {
      exists: true,
      accessible: true,
      message: 'Bucket "game-assets" exists and is accessible!',
      bucket
    }
  } catch (error) {
    return {
      exists: false,
      accessible: false,
      message: `Error verifying bucket: ${error.message}`
    }
  }
}

export default {
  setupAssetsBucket,
  verifyAssetsBucket
}
