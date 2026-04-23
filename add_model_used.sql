-- Adicionar a coluna model_used (Para rastrear qual IA gerou qual roteiro)
ALTER TABLE roteiros 
ADD COLUMN IF NOT EXISTS model_used TEXT;

-- Opcional: preencher roteiros existentes com "desconhecido" caso você precise separar 
-- os antigos (antes dessa atualização) dos novos.
UPDATE roteiros SET model_used = 'desconhecido' WHERE model_used IS NULL;
