-- ============================================
-- Migration: Adicionar latitude/longitude
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Adicionar colunas de geolocalizacao na tabela terrenos
ALTER TABLE terrenos ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE terrenos ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Index para consultas geograficas
CREATE INDEX IF NOT EXISTS idx_terrenos_lat_lng ON terrenos(latitude, longitude);
