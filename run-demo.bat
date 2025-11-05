@echo off
echo Starting MERN Document Search Demo (No Redis/Worker)
echo.
echo This demo runs without Redis - OCR processing is simulated
echo.

cd backend
start "Backend" cmd /k "npm run dev"

timeout /t 3

cd ..\frontend  
start "Frontend" cmd /k "npm run dev"

echo.
echo Starting services...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to continue...
pause