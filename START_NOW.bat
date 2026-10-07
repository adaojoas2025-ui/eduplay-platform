@echo off
setlocal
title EDUPLAY - INICIANDO PLATAFORMA

set "PLATFORM_DIR=%~dp0"
set "BACKEND_DIR=%PLATFORM_DIR%backend"
set "FRONTEND_DIR=%PLATFORM_DIR%frontend"

echo ==========================================
echo   INICIANDO EDUPLAY COM AVATAR
echo ==========================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo ERRO: Node.js e npm nao foram encontrados.
  echo Instale o Node.js e tente novamente.
  pause
  exit /b 1
)

if not exist "%FRONTEND_DIR%\node_modules" (
  echo Instalando dependencias do frontend...
  pushd "%FRONTEND_DIR%"
  call npm install
  if errorlevel 1 goto :erro
  popd
)

if not exist "%BACKEND_DIR%\node_modules" (
  echo Instalando dependencias do backend...
  pushd "%BACKEND_DIR%"
  call npm install
  if errorlevel 1 goto :erro
  popd
)

echo Iniciando backend...
start "Backend EDUPLAY" /min cmd /k "cd /d ""%BACKEND_DIR%"" && npm run dev"

echo Iniciando frontend...
start "Frontend EDUPLAY" /min cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev"

echo.
echo A plataforma sera aberta em http://localhost:5173
timeout /t 6 /nobreak >nul
start "" "http://localhost:5173"
exit /b 0

:erro
echo.
echo Nao foi possivel instalar as dependencias.
pause
exit /b 1
