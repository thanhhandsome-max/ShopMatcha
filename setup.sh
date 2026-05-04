#!/bin/bash
# ShopMatcha Project Setup Script
# This script sets up the entire project for development

set -e

echo "🎉 ShopMatcha Project Setup"
echo "=================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Generate Prisma client
echo "🔧 Step 2: Generating Prisma client..."
npm run prisma:generate
echo "✅ Prisma client generated"
echo ""

# Step 3: Run database migration
echo "🗄️  Step 3: Running database migrations..."
npm run prisma:migrate -- --name "initial_schema"
echo "✅ Database migration complete"
echo ""

# Step 4: Seed sample data
echo "🌱 Step 4: Seeding sample data..."
npm run prisma:seed
echo "✅ Sample data seeded"
echo ""

# Step 5: Run type check
echo "✔️  Step 5: Checking TypeScript..."
npm run typecheck
echo "✅ TypeScript check passed"
echo ""

# Step 6: Run linting
echo "🔍 Step 6: Running linter..."
npm run lint
echo "✅ Linting passed"
echo ""

echo "=================================="
echo "✨ Setup Complete!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "   Start development server:"
echo "   npm run dev"
echo ""
echo "   Run tests:"
echo "   npm run test"
echo ""
echo "   View database GUI:"
echo "   npx prisma studio"
echo ""
echo "   API Documentation:"
echo "   - API_DOCUMENTATION.md"
echo "   - DEVELOPMENT_GUIDE.md"
echo ""
