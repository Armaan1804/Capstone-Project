@echo off
echo Starting MERN Document Search Application...

REM Check if Docker is available
docker-compose --version >nul 2>&1
if %errorlevel% == 0 (
    echo Docker Compose found. Starting with Docker...
    docker-compose up -d
    echo Application started with Docker!
    echo Frontend: http://localhost:5173
    echo Backend API: http://localhost:3000
    echo MongoDB: localhost:27017
    echo Redis: localhost:6379
) else (
    echo Docker not found. Starting in development mode...
    
    REM Check if Node.js is available
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Node.js is required but not installed. Please install Node.js 18+ and try again.
        pause
        exit /b 1
    )
    
    REM Install dependencies if needed
    if not exist "node_modules" (
        echo Installing dependencies...
        npm run install:all
    )
    
    echo Please ensure MongoDB and Redis are running locally:
    echo - MongoDB: mongodb://localhost:27017
    echo - Redis: localhost:6379
    echo.
    echo Starting development servers...
    
    REM Start in development mode
    npm run dev
)

pause