@echo off
echo Testing API endpoints...
echo.

echo 1. Health Check:
curl http://localhost:3000/api/health
echo.
echo.

echo 2. Upload Test File:
echo Creating test file...
echo This is a test document for OCR processing. > test.txt
curl -X POST http://localhost:3000/api/upload -F "document=@test.txt"
echo.
echo.

echo 3. List Documents:
curl http://localhost:3000/api/documents
echo.
echo.

echo 4. Search Test:
curl "http://localhost:3000/api/search?q=test"
echo.
echo.

del test.txt
echo Test complete!
pause