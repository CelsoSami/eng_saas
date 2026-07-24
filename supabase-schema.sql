-- ============================================
-- TerraeScope - Schema do Banco de Dados
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Tabela de perfis de usuarios (estende auth.users)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  empresa TEXT,
  telefone TEXT,
  plano TEXT DEFAULT 'gratuito',
  status TEXT DEFAULT 'ativo',
  licenca TEXT,
  data_cadastro TIMESTAMPTZ DEFAULT now(),
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de terrenos
CREATE TABLE IF NOT EXISTS terrenos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  logradouro TEXT,
  cidade TEXT,
  uf TEXT,
  cep TEXT,
  area NUMERIC,
  matricula TEXT,
  valor_mercado NUMERIC,
  zona TEXT,
  observacoes TEXT,
  favorito BOOLEAN DEFAULT false,
  latitude NUMERIC,
  longitude NUMERIC,
  iptu TEXT,
  face TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projetos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'em andamento',
  terreno_ids BIGINT[] DEFAULT '{}',
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de analises
CREATE TABLE IF NOT EXISTS analises (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  terreno_id BIGINT,
  tipo TEXT,
  data_analise TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de historico
CREATE TABLE IF NOT EXISTS historico (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT,
  terreno_id BIGINT,
  logradouro TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de licencas
CREATE TABLE IF NOT EXISTS licencas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  plano TEXT NOT NULL,
  validade TIMESTAMPTZ,
  status TEXT DEFAULT 'ativa',
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de uso (quota mensal)
CREATE TABLE IF NOT EXISTS uso (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  periodo TEXT NOT NULL,
  buscas INTEGER DEFAULT 0,
  projetos INTEGER DEFAULT 0,
  analises INTEGER DEFAULT 0,
  UNIQUE(usuario_id, periodo)
);

-- Tabela de configuracoes
CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor JSONB
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_terrenos_usuario ON terrenos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_terrenos_cidade ON terrenos(cidade);
CREATE INDEX IF NOT EXISTS idx_terrenos_uf ON terrenos(uf);
CREATE INDEX IF NOT EXISTS idx_terrenos_cep ON terrenos(cep);
CREATE INDEX IF NOT EXISTS idx_terrenos_matricula ON terrenos(matricula);
CREATE INDEX IF NOT EXISTS idx_projetos_usuario ON projetos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_analises_usuario ON analises(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_licencas_chave ON licencas(chave);
CREATE INDEX IF NOT EXISTS idx_uso_usuario ON uso(usuario_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrenos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE licencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Usuarios: cada um ve/edita apenas seu proprio perfil
CREATE POLICY "usuarios_select_own" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "usuarios_insert_own" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "usuarios_update_own" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- Terrenos: cada um ve/edita apenas seus proprios
CREATE POLICY "terrenos_select_own" ON terrenos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "terrenos_insert_own" ON terrenos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "terrenos_update_own" ON terrenos FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "terrenos_delete_own" ON terrenos FOR DELETE USING (auth.uid() = usuario_id);

-- Projetos: cada um ve/edita apenas seus proprios
CREATE POLICY "projetos_select_own" ON projetos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "projetos_insert_own" ON projetos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "projetos_update_own" ON projetos FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "projetos_delete_own" ON projetos FOR DELETE USING (auth.uid() = usuario_id);

-- Analises: cada um ve/edita apenas suas proprias
CREATE POLICY "analises_select_own" ON analises FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "analises_insert_own" ON analises FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "analises_delete_own" ON analises FOR DELETE USING (auth.uid() = usuario_id);

-- Historico: cada um ve/edita apenas seu proprio
CREATE POLICY "historico_select_own" ON historico FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "historico_insert_own" ON historico FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "historico_delete_own" ON historico FOR DELETE USING (auth.uid() = usuario_id);

-- Licencas: leitura publica (para validacao), escrita so admin
CREATE POLICY "licencas_select" ON licencas FOR SELECT USING (true);
CREATE POLICY "licencas_insert" ON licencas FOR INSERT WITH CHECK (true);
CREATE POLICY "licencas_update" ON licencas FOR UPDATE USING (true);

-- Uso: cada um ve/edita apenas seu proprio
CREATE POLICY "uso_select_own" ON uso FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "uso_insert_own" ON uso FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "uso_update_own" ON uso FOR UPDATE USING (auth.uid() = usuario_id);

-- Configuracoes: leitura/escrita publica (para configs gerais do app)
CREATE POLICY "configuracoes_select" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "configuracoes_insert" ON configuracoes FOR INSERT WITH CHECK (true);
CREATE POLICY "configuracoes_update" ON configuracoes FOR UPDATE USING (true);

-- ============================================
-- FUNCAO: Auto-criar perfil ao cadastrar
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, plano, status, data_cadastro)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', ''), 'gratuito', 'ativo', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
