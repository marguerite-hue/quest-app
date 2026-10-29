/**
 * Asset Manager - Supabase Storage Helper
 * 
 * Manages game assets stored in Supabase Storage bucket 'game-assets'
 * Provides functions to upload, retrieve, and list assets
 */

import { supabase } from '../supabase'

const BUCKET_NAME = 'game-assets'

/**
 * Asset Manager Class
 */
class AssetManager {
  /**
   * Upload an asset to Supabase Storage
   * @param {File|Blob} file - File to upload
   * @param {string} path - Path where to store the file (e.g., 'illustrations/carnet-quetes.png')
   * @param {Object} options - Upload options
   * @returns {Promise<{url: string, path: string}>} Public URL and storage path
   */
  async uploadAsset(file, path, options = {}) {
    try {
      const {
        upsert = false,
        contentType = null,
        cacheControl = '3600',
      } = options

      // Determine content type if not provided
      let fileContentType = contentType
      if (!fileContentType && file.type) {
        fileContentType = file.type
      } else if (!fileContentType) {
        // Guess from extension
        const ext = path.split('.').pop().toLowerCase()
        const typeMap = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          svg: 'image/svg+xml',
          webp: 'image/webp',
          mp4: 'video/mp4',
          mp3: 'audio/mpeg',
        }
        fileContentType = typeMap[ext] || 'application/octet-stream'
      }

      const uploadOptions = {
        contentType: fileContentType,
        cacheControl,
        upsert,
      }

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, uploadOptions)

      if (error) {
        // Handle bucket not found
        if (error.message.includes('Bucket not found') || error.message.includes('does not exist')) {
          throw new Error(
            `Storage bucket "${BUCKET_NAME}" not found. Please create it in Supabase Dashboard > Storage.`
          )
        }
        throw error
      }

      // Get public URL
      const publicUrl = await this.getPublicUrl(path)

      return {
        url: publicUrl,
        path: data.path,
        fullPath: data.fullPath,
      }
    } catch (error) {
      console.error('Error uploading asset:', error)
      throw error
    }
  }

  /**
   * Get public URL for an asset
   * @param {string} path - Path to asset in storage bucket
   * @returns {string} Public URL
   */
  getPublicUrl(path) {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return data.publicUrl
  }

  /**
   * List all assets in a folder
   * @param {string} folder - Folder path (e.g., 'illustrations' or 'images')
   * @param {Object} options - List options
   * @returns {Promise<Array>} List of asset objects
   */
  async listAssets(folder = '', options = {}) {
    try {
      const { limit = 100, offset = 0, sortBy = { column: 'name', order: 'asc' } } = options

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folder, {
          limit,
          offset,
          sortBy,
        })

      if (error) {
        if (error.message.includes('Bucket not found')) {
          throw new Error(
            `Storage bucket "${BUCKET_NAME}" not found. Please create it in Supabase Dashboard > Storage.`
          )
        }
        throw error
      }

      // Transform to include public URLs
      const assets = data.map((item) => ({
        name: item.name,
        path: folder ? `${folder}/${item.name}` : item.name,
        url: this.getPublicUrl(folder ? `${folder}/${item.name}` : item.name),
        size: item.metadata?.size || 0,
        updatedAt: item.updated_at,
        createdAt: item.created_at,
      }))

      return assets
    } catch (error) {
      console.error('Error listing assets:', error)
      throw error
    }
  }

  /**
   * Delete an asset
   * @param {string} path - Path to asset in storage bucket
   * @returns {Promise<boolean>} Success status
   */
  async deleteAsset(path) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path])

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting asset:', error)
      throw error
    }
  }

  /**
   * Download an asset as a blob
   * @param {string} path - Path to asset in storage bucket
   * @returns {Promise<Blob>} Asset blob
   */
  async downloadAsset(path) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(path)

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error downloading asset:', error)
      throw error
    }
  }

  /**
   * Check if bucket exists and provide setup instructions if needed
   * Note: Bucket creation must be done via SQL (see supabase/migrations/20260112112930_create_game_assets_bucket.sql)
   */
  async ensureBucket() {
    try {
      // List buckets to check if it exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        throw new Error(
          `Cannot access storage buckets. Please run supabase/migrations/20260112112930_create_game_assets_bucket.sql in Supabase SQL Editor.`
        )
      }

      const bucketExists = buckets.some((bucket) => bucket.name === BUCKET_NAME)

      if (!bucketExists) {
        throw new Error(
          `Bucket "${BUCKET_NAME}" does not exist. Please run supabase/migrations/20260112112930_create_game_assets_bucket.sql in Supabase SQL Editor.`
        )
      }

      return true
    } catch (error) {
      console.error('Error checking bucket:', error)
      throw error
    }
  }
}

// Export singleton instance
export const assetManager = new AssetManager()

// Export class for advanced usage
export default AssetManager
