#!/bin/bash

# Script to populate retailer inventory data
# This fixes the missing data issue in retailer stock verification

echo "🔄 Populating retailer inventory data..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory"
    exit 1
fi

# Run the SQL script
echo "📊 Inserting sample retailer inventory data..."
supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres

# Apply the population script
psql postgresql://postgres:postgres@localhost:54322/postgres -f populate_retailer_inventory.sql

if [ $? -eq 0 ]; then
    echo "✅ Successfully populated retailer inventory data!"
    echo ""
    echo "📋 Summary:"
    echo "   - Added sample retailer inventory records"
    echo "   - Created stock verification history"
    echo "   - Fixed missing data issue in retailer stock verification"
    echo ""
    echo "🚀 You can now test the retailer stock verification feature!"
else
    echo "❌ Failed to populate data. Check the error messages above."
    exit 1
fi