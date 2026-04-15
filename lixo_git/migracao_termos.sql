-- Migration: Assinaturas e Termos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_accepted_terms boolean DEFAULT false;
