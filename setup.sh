#!/bin/bash
# Quick Start Guide for ShopMatcha (After React → Next.js Migration)

echo "🚀 ShopMatcha - Next.js Migration Quick Start"
echo "============================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# TypeScript check
echo "🔍 Running TypeScript type check..."
npm run typecheck

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Start development server: npm run dev"
echo "   2. Open browser: http://localhost:3000"
echo "   3. For production: npm run build && npm start"
echo ""
echo "📚 Additional commands:"
echo "   npm run lint       - Run ESLint"
echo "   npm run lint:fix   - Fix linting issues"
echo "   npm run format     - Format code with Prettier"
echo ""
echo "📖 For more info, see MIGRATION.md and MIGRATION_COMPLETE.md"
