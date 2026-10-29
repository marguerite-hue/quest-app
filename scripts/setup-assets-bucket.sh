#!/bin/bash

# Setup Game Assets Bucket Script
# This script helps set up the game-assets bucket in Supabase

echo "🎮 Game Assets Bucket Setup"
echo "============================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found."
    echo ""
    echo "Option 1: Install Supabase CLI"
    echo "  npm install -g supabase"
    echo ""
    echo "Option 2: Run SQL manually"
    echo "  1. Go to Supabase Dashboard → SQL Editor"
    echo "  2. Open supabase/migrations/20260112112930_create_game_assets_bucket.sql"
    echo "  3. Copy and paste into SQL Editor"
    echo "  4. Click Run"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "⚠️  Not in a Supabase project directory"
    echo "   Run this from your project root"
    echo ""
    exit 1
fi

echo "📦 Applying migration to create game-assets bucket..."
echo ""

# Apply the migration
if supabase db push; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "The 'game-assets' bucket should now be available in your Supabase project."
    echo "You can verify it in: Supabase Dashboard → Storage"
else
    echo ""
    echo "❌ Migration failed"
    echo ""
    echo "Please run the SQL manually:"
    echo "  1. Go to Supabase Dashboard → SQL Editor"
    echo "  2. Open supabase/migrations/20260112112930_create_game_assets_bucket.sql"
    echo "  3. Copy and paste into SQL Editor"
    echo "  4. Click Run"
    echo ""
    exit 1
fi
