@echo off
chcp 65001 >nul

:: Change to script directory
cd /d "%~dp0"

echo Starting Lawn Mower Demo Game Server...

:: Kill process using port 8080
echo Checking port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo Killing process %%a occupying port 8080...
    taskkill /F /PID %%a >nul 2>nul
)

:: Check if pnpm is installed
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo pnpm not found. Installing...
    call npm install -g pnpm
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call pnpm install
)

:: Build shared package
echo Building shared package...
call pnpm --filter @example/lawn-mower-shared build

:: Build and start server
echo Building and starting server...
call pnpm --filter @example/lawn-mower-server build
call pnpm --filter @example/lawn-mower-server start

pause
