@echo off
echo ========================================
echo INICIANDO SERVIDORES EDUPLAY
echo ========================================
echo.

echo [1/2] Iniciando BACKEND na porta 3000...
start "EDUPLAY Backend" cmd /k "cd /d c:\projetos\backend && npm run dev"

timeout /t 5 /nobreak > nul

echo [2/2] Iniciando FRONTEND na porta 5173...
start "EDUPLAY Frontend" cmd /k "cd /d c:\projetos\frontend && npm run dev"

echo.
echo ========================================
echo SERVIDORES INICIADOS!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Aguarde alguns segundos ate os servidores iniciarem completamente...
echo.
pause
