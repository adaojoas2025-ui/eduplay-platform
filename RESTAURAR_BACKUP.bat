@echo off
chcp 65001 >nul
echo.
echo ════════════════════════════════════════════════════════
echo   🔄 RESTAURAR BACKUP DO PROJETO EDUPLAY
echo ════════════════════════════════════════════════════════
echo.

echo 📋 Backups disponíveis:
echo.
git tag
echo.

set /p BACKUP_TAG="Digite o nome do backup que deseja restaurar: "

if "%BACKUP_TAG%"=="" (
    echo ❌ Você precisa informar um backup!
    pause
    exit /b 1
)

echo.
echo ⚠️  ATENÇÃO: Isso vai descartar todas as mudanças não salvas!
echo.
set /p CONFIRM="Tem certeza? (S/N): "

if /i not "%CONFIRM%"=="S" (
    echo ❌ Restauração cancelada.
    pause
    exit /b 0
)

echo.
echo 🔄 Restaurando backup: %BACKUP_TAG%
git checkout %BACKUP_TAG%

echo.
echo ✅ BACKUP RESTAURADO!
echo.
echo 📦 Agora reinstale as dependências:
echo    cd backend
echo    npm install
echo.
echo    cd ../frontend
echo    npm install
echo.
pause
