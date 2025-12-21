@echo off
title INICIANDO EDUPLAY
echo ==========================================
echo INICIANDO SERVIDORES - AGUARDE...
echo ==========================================
echo.

cd /d c:\projetos\backend
start "Backend EDUPLAY" /min cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

cd /d c:\projetos\frontend
start "Frontend EDUPLAY" /min cmd /k "npm run dev"

echo.
echo ==========================================
echo SERVIDORES INICIADOS!
echo ==========================================
echo.
echo Aguarde 30 segundos e acesse:
echo http://localhost:5173
echo.
echo Login: ja.eduplay@gmail.com
echo Senha: Asa122448@
echo.
timeout /t 30 /nobreak
start http://localhost:5173
exit
