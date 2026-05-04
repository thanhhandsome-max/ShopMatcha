@echo off
REM ShopMatcha Project Setup Script (Windows)
REM This script sets up the entire project for development

echo.
echo 🎉 ShopMatcha Project Setup
echo ==================================
echo.

REM Step 1: Install dependencies
echo 📦 Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 2: Generate Prisma client
echo 🔧 Step 2: Generating Prisma client...
call npm run prisma:generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    exit /b 1
)
echo ✅ Prisma client generated
echo.

REM Step 3: Run database migration
echo 🗄️  Step 3: Running database migrations...
call npm run prisma:migrate -- --name "initial_schema"
if errorlevel 1 (
    echo ❌ Failed to run migrations
    exit /b 1
)
echo ✅ Database migration complete
echo.

REM Step 4: Seed sample data
echo 🌱 Step 4: Seeding sample data...
call npm run prisma:seed
if errorlevel 1 (
    echo ❌ Failed to seed data
    exit /b 1
)
echo ✅ Sample data seeded
echo.

REM Step 5: Run type check
echo ✔️  Step 5: Checking TypeScript...
call npm run typecheck
if errorlevel 1 (
    echo ❌ Failed type check
    exit /b 1
)
echo ✅ TypeScript check passed
echo.

REM Step 6: Run linting
echo 🔍 Step 6: Running linter...
call npm run lint
echo ✅ Linting passed
echo.

echo ==================================
echo ✨ Setup Complete!
echo.
echo 🚀 Next steps:
echo.
echo    Start development server:
echo    npm run dev
echo.
echo    Run tests:
echo    npm run test
echo.
echo    View database GUI:
echo    npx prisma studio
echo.
echo    API Documentation:
echo    - API_DOCUMENTATION.md
echo    - DEVELOPMENT_GUIDE.md
echo.

pause
