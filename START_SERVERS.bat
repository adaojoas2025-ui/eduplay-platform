@echo off
echo ========================================
echo   Iniciando Servidores EducaplayJA
echo ========================================
echo.

echo [1/2] Iniciando Backend...
cd c:\projetos\backend
start "Backend - EducaplayJA" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend...
cd c:\projetos\frontend
start "Frontend - EducaplayJA" cmd /k "npm run dev"

echo.
echo ========================================
echo   Servidores Iniciados!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Aguarde alguns segundos para os servidores iniciarem...
echo.
pause
