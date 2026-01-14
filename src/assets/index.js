/**
 * Assets Registry - Central Export for All Game Assets
 * 
 * This file serves as the central registry for all assets in the game.
 * Import assets from here: import { carnetQuetes } from '@/assets'
 * 
 * Naming Convention: camelCase for exports, kebab-case for file names
 */

// ============================================
// ILLUSTRATIONS
// ============================================
// Game universe illustrations, quest book, backgrounds, etc.

// Quest Book Assets - From Supabase Storage
import { assetManager } from '@/utils/assetManager'

// Get quest book image URL from Supabase Storage
// Falls back to local asset if storage is not available
export const getCarnetQuetesUrl = () => {
  try {
    // Try to get from Supabase Storage first
    return assetManager.getPublicUrl('illustrations/journal-quetes.png')
  } catch (error) {
    // If local asset exists, it will be imported directly
    // Otherwise return placeholder
    return 'https://via.placeholder.com/400x300?text=Carnet+de+Quêtes'
  }
}

// Try to import local asset as fallback (only if file exists)
let localCarnetQuetes = null
try {
  localCarnetQuetes = new URL('./illustrations/journal-quetes.png', import.meta.url).href
} catch {
  // Local asset doesn't exist, will use Supabase Storage
}

// export { default as questBookOpen } from './illustrations/quest-book-open.png'
// export { default as villageBackground } from './illustrations/village-background.png'

// ============================================
// IMAGES
// ============================================
// General images, photos, user uploads, etc.

// Placeholder exports - replace with actual assets when available
// export { default as defaultAvatar } from './images/default-avatar.png'
// export { default as placeholderQuest } from './images/placeholder-quest.png'

// ============================================
// ICONS
// ============================================
// UI icons, category icons, status icons, etc.

// Placeholder exports - replace with actual assets when available
// export { default as iconQuest } from './icons/quest.svg'
// export { default as iconCompleted } from './icons/completed.svg'
// export { default as iconInProgress } from './icons/in-progress.svg'

// ============================================
// UTILITY FUNCTIONS
// ============================================
/**
 * Get asset URL from Supabase Storage
 * @param {string} path - Path to asset in storage bucket
 * @returns {string} Public URL
 */
export const getStorageAssetUrl = async (path) => {
  const { assetManager } = await import('@/utils/assetManager')
  return assetManager.getPublicUrl(path)
}

/**
 * Get all available assets from Supabase Storage
 * @returns {Promise<Array>} List of asset objects
 */
export const getStorageAssets = async () => {
  const { assetManager } = await import('@/utils/assetManager')
  return assetManager.listAssets()
}

// Export empty object for now (will be populated as assets are added)
export default {}
