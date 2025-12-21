@echo off
chcp 65001 >nul
echo.
echo ════════════════════════════════════════════════════════
echo   🛡️  CRIAR BACKUP DO PROJETO EDUPLAY
echo ════════════════════════════════════════════════════════
echo.

REM Pegar data e hora atual
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
    set mydate=%%c%%b%%a
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set mytime=%%a%%b
)

set BACKUP_TAG=backup-%mydate%-%mytime%

echo 📋 Verificando status do Git...
git status
echo.

echo 📦 Adicionando todas as alterações...
git add .
echo.

echo 💾 Criando commit de backup...
git commit -m "BACKUP: Salvando estado do projeto em %date% %time%"
echo.

echo 🏷️  Criando tag de backup: %BACKUP_TAG%
git tag -a "%BACKUP_TAG%" -m "Backup automático criado em %date% %time%"
echo.

echo ✅ BACKUP CRIADO COM SUCESSO!
echo.
echo Tag criada: %BACKUP_TAG%
echo.
echo 📋 Para restaurar este backup no futuro:
echo    git checkout %BACKUP_TAG%
echo.
echo 📋 Ver todos os backups:
echo    git tag
echo.
pause
