@echo off
REM Quick Start Guide for ShopMatcha (After React → Next.js Migration)

echo.
echo 🚀 ShopMatcha - Next.js Migration Quick Start
echo ============================================
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install Node.js and npm first.
    pause
    exit /b 1
)

echo ✅ npm found: 
npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM TypeScript check
echo 🔍 Running TypeScript type check...
call npm run typecheck

echo.
echo ✅ Setup complete!
echo.
echo 🚀 Next steps:
echo    1. Start development server: npm run dev
echo    2. Open browser: http://localhost:3000
echo    3. For production: npm run build ^&^& npm start
echo.
echo 📚 Additional commands:
echo    npm run lint       - Run ESLint
echo    npm run lint:fix   - Fix linting issues
echo    npm run format     - Format code with Prettier
echo.
echo 📖 For more info, see MIGRATION.md and MIGRATION_COMPLETE.md
echo.
pause
