@echo off
echo ========================================
echo Criando banco de dados EDUPLAY
echo ========================================
echo.
echo Digite a senha do PostgreSQL quando solicitado: Asa122448@
echo.
psql -U postgres -c "CREATE DATABASE eduplay;"
echo.
echo ========================================
echo Banco de dados criado com sucesso!
echo ========================================
pause
