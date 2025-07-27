@echo off
echo Starting SuiteCRM Real Estate Pro Frontend...
echo.

echo Navigating to frontend directory...
cd suitecrm-real-estate-pro\frontend

echo.
echo Checking Node.js and npm versions...
node --version
npm --version

echo.
echo Cleaning npm cache and reinstalling dependencies...
npm cache clean --force
del package-lock.json
npm install

echo.
echo Verifying Vite installation...
npx vite --version

echo.
echo Starting Vite development server...
echo Frontend will be available at: http://localhost:3000
echo.
npx vite --host 0.0.0.0 --port 3000

pause 