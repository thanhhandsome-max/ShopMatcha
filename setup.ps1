# ShopMatcha - PowerShell Setup Script
# This script will setup the development environment for ShopMatcha on Windows

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ShopMatcha - Development Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 1: Install dependencies
Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Generate Prisma client
Write-Host "[3/5] Generating Prisma client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✓ Prisma client generated" -ForegroundColor Green
} catch {
    Write-Host "⚠ WARNING: Could not generate Prisma client" -ForegroundColor Yellow
    Write-Host "  You may need to setup the database with 'npx prisma migrate dev' later" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Check environment variables
Write-Host "[4/5] Checking environment setup..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local found" -ForegroundColor Green
} else {
    Write-Host "ℹ .env.local not found. Using defaults from .env.example" -ForegroundColor Cyan
    Write-Host "  You may need to create/update .env.local for your specific setup" -ForegroundColor Cyan
}

Write-Host ""

# Step 4: Verify Next.js installation
Write-Host "[5/5] Verifying Next.js installation..." -ForegroundColor Yellow
try {
    $nextVersion = npx next --version
    Write-Host "✓ Next.js version: $nextVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Next.js is not properly installed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Completed Successfully!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 To start development server, run:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Then open http://localhost:3000 in your browser." -ForegroundColor Green
Write-Host ""

Write-Host "📚 For more information, see:" -ForegroundColor Cyan
Write-Host "   - DEVELOPMENT.md" -ForegroundColor White
Write-Host "   - MIGRATION_CHECKLIST.md" -ForegroundColor White
Write-Host "   - GET_STARTED.md" -ForegroundColor White
Write-Host ""

Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "   npm run dev       - Start development server" -ForegroundColor White
Write-Host "   npm run build     - Build for production" -ForegroundColor White
Write-Host "   npm start         - Start production server" -ForegroundColor White
Write-Host "   npm run lint      - Run ESLint" -ForegroundColor White
Write-Host "   npm run format    - Format code with Prettier" -ForegroundColor White
Write-Host ""
