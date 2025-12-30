@echo off
echo ========================================
echo   EDUPLAY - Backup do Banco de Dados
echo ========================================
echo.

REM Definir data/hora para o nome do arquivo
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%b-%%a)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set datetime=%mydate%_%mytime%

REM Criar pasta de backups se não existir
if not exist "c:\projetos\backups" mkdir "c:\projetos\backups"

REM Nome do arquivo de backup
set BACKUP_FILE=c:\projetos\backups\eduplay_backup_%datetime%.sql

echo Criando backup em: %BACKUP_FILE%
echo.

REM Fazer backup usando pg_dump
REM Ajuste as variáveis conforme sua configuração
set PGPASSWORD=postgres
pg_dump -U postgres -h localhost -p 5432 eduplay > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Backup criado com sucesso!
    echo ========================================
    echo   Arquivo: %BACKUP_FILE%
    echo.
    dir "%BACKUP_FILE%"
) else (
    echo.
    echo ========================================
    echo   ERRO ao criar backup!
    echo ========================================
)

echo.
pause
