-- Script para criar o banco de dados EducaplayJA
-- Execute este script no pgAdmin ou SQL Shell (psql)

-- Criar o banco de dados (se não existir)
CREATE DATABASE educaplayja
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE educaplayja
    IS 'EducaplayJA - Marketplace de Cursos Digitais';
