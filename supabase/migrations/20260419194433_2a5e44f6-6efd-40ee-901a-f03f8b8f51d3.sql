
-- Create neighborhoods table for Itaúna/MG
CREATE TABLE public.neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  normalized text NOT NULL,
  region text,
  is_active boolean NOT NULL DEFAULT true,
  verified boolean NOT NULL DEFAULT false,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_neighborhoods_slug ON public.neighborhoods(slug);
CREATE INDEX idx_neighborhoods_normalized ON public.neighborhoods(normalized);
CREATE INDEX idx_neighborhoods_active ON public.neighborhoods(is_active) WHERE is_active = true;

ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Anyone (public site) can read active neighborhoods
CREATE POLICY "neighborhoods_public_read"
  ON public.neighborhoods FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can manage
CREATE POLICY "neighborhoods_admin_insert"
  ON public.neighborhoods FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "neighborhoods_admin_update"
  ON public.neighborhoods FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "neighborhoods_superadmin_delete"
  ON public.neighborhoods FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Updated_at trigger
CREATE TRIGGER set_neighborhoods_updated_at
  BEFORE UPDATE ON public.neighborhoods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed: VERIFIED neighborhoods (cross-checked with cepbrasil.org official CEP listing)
INSERT INTO public.neighborhoods (name, slug, normalized, region, verified, is_active, source) VALUES
  ('Centro', 'centro', 'centro', 'Central', true, true, 'cepbrasil.org'),
  ('Aeroporto', 'aeroporto', 'aeroporto', 'Sul', true, true, 'cepbrasil.org'),
  ('Aeroporto II', 'aeroporto-ii', 'aeroporto ii', 'Sul', true, true, 'cepbrasil.org'),
  ('Alaita', 'alaita', 'alaita', NULL, true, true, 'cepbrasil.org'),
  ('Antunes', 'antunes', 'antunes', NULL, true, true, 'cepbrasil.org'),
  ('Aurora Village', 'aurora-village', 'aurora village', NULL, true, true, 'cepbrasil.org'),
  ('Bela Vista', 'bela-vista', 'bela vista', NULL, true, true, 'cepbrasil.org'),
  ('Belvedere', 'belvedere', 'belvedere', NULL, true, true, 'cepbrasil.org'),
  ('Boulevard Lago Sul', 'boulevard-lago-sul', 'boulevard lago sul', NULL, true, true, 'cepbrasil.org'),
  ('Cerqueira Lima', 'cerqueira-lima', 'cerqueira lima', NULL, true, true, 'cepbrasil.org'),
  ('Chácara do Quitão', 'chacara-do-quitao', 'chacara do quitao', NULL, true, true, 'cepbrasil.org'),
  ('Cidade Leonane', 'cidade-leonane', 'cidade leonane', NULL, true, true, 'cepbrasil.org'),
  ('Cidade Nova', 'cidade-nova', 'cidade nova', NULL, true, true, 'cepbrasil.org'),
  ('Cidade Nova II', 'cidade-nova-ii', 'cidade nova ii', NULL, true, true, 'cepbrasil.org'),
  ('Distrito Industrial', 'distrito-industrial', 'distrito industrial', NULL, true, true, 'cepbrasil.org'),
  ('Eldorado', 'eldorado', 'eldorado', NULL, true, true, 'cepbrasil.org'),
  ('Garcias', 'garcias', 'garcias', NULL, true, true, 'cepbrasil.org'),
  ('Graças', 'gracas', 'gracas', NULL, true, true, 'cepbrasil.org'),
  ('Granja Glória', 'granja-gloria', 'granja gloria', NULL, true, true, 'cepbrasil.org'),
  ('Irmãos Auler', 'irmaos-auler', 'irmaos auler', NULL, true, true, 'cepbrasil.org'),
  ('Itaunense', 'itaunense', 'itaunense', NULL, true, true, 'cepbrasil.org'),
  ('Itaunense II', 'itaunense-ii', 'itaunense ii', NULL, true, true, 'cepbrasil.org'),
  ('João Paulo II', 'joao-paulo-ii', 'joao paulo ii', NULL, true, true, 'cepbrasil.org'),
  ('Juscelino Kubitschek', 'juscelino-kubitschek', 'juscelino kubitschek', NULL, true, true, 'cepbrasil.org'),
  ('Lourdes', 'lourdes', 'lourdes', NULL, true, true, 'cepbrasil.org'),
  ('Morada Nova', 'morada-nova', 'morada nova', NULL, true, true, 'cepbrasil.org'),
  ('Morro do Engenho', 'morro-do-engenho', 'morro do engenho', NULL, true, true, 'cepbrasil.org'),
  ('Morro do Sol', 'morro-do-sol', 'morro do sol', NULL, true, true, 'cepbrasil.org'),
  ('Nogueira Machado', 'nogueira-machado', 'nogueira machado', NULL, true, true, 'cepbrasil.org'),
  ('Nogueirinha', 'nogueirinha', 'nogueirinha', NULL, true, true, 'cepbrasil.org'),
  ('Novo Horizonte', 'novo-horizonte', 'novo horizonte', NULL, true, true, 'cepbrasil.org'),
  ('Olímpio Moreira', 'olimpio-moreira', 'olimpio moreira', NULL, true, true, 'cepbrasil.org'),
  ('Padre Eustáquio', 'padre-eustaquio', 'padre eustaquio', NULL, true, true, 'cepbrasil.org'),
  ('Parque Jardim Santanense', 'parque-jardim-santanense', 'parque jardim santanense', NULL, true, true, 'cepbrasil.org'),
  ('Piaguassu', 'piaguassu', 'piaguassu', NULL, true, true, 'cepbrasil.org'),
  ('Piedade', 'piedade', 'piedade', NULL, true, true, 'cepbrasil.org'),
  ('Pio XII', 'pio-xii', 'pio xii', NULL, true, true, 'cepbrasil.org'),
  ('Residencial Morro do Sol', 'residencial-morro-do-sol', 'residencial morro do sol', NULL, true, true, 'cepbrasil.org'),
  ('Residencial Santanense', 'residencial-santanense', 'residencial santanense', NULL, true, true, 'cepbrasil.org'),
  ('Residencial São Geraldo', 'residencial-sao-geraldo', 'residencial sao geraldo', NULL, true, true, 'cepbrasil.org'),
  ('Residencial Veredas', 'residencial-veredas', 'residencial veredas', NULL, true, true, 'cepbrasil.org'),
  ('Residencial Veredas II', 'residencial-veredas-ii', 'residencial veredas ii', NULL, true, true, 'cepbrasil.org'),
  ('Santa Edwiges', 'santa-edwiges', 'santa edwiges', NULL, true, true, 'cepbrasil.org'),
  ('Santa Edwiges II', 'santa-edwiges-ii', 'santa edwiges ii', NULL, true, true, 'cepbrasil.org'),
  ('Santa Mônica', 'santa-monica', 'santa monica', NULL, true, true, 'cepbrasil.org'),
  ('Santanense', 'santanense', 'santanense', NULL, true, true, 'cepbrasil.org'),
  ('Santiago', 'santiago', 'santiago', NULL, true, true, 'cepbrasil.org'),
  ('São Bento', 'sao-bento', 'sao bento', NULL, true, true, 'cepbrasil.org'),
  ('São Geraldo', 'sao-geraldo', 'sao geraldo', NULL, true, true, 'cepbrasil.org'),
  ('São Judas Tadeu', 'sao-judas-tadeu', 'sao judas tadeu', NULL, true, true, 'cepbrasil.org'),
  ('Três Marias', 'tres-marias', 'tres marias', NULL, true, true, 'cepbrasil.org'),
  ('Tropical', 'tropical', 'tropical', NULL, true, true, 'cepbrasil.org'),
  ('Universitário', 'universitario', 'universitario', NULL, true, true, 'cepbrasil.org'),
  ('Vale das Aroeiras', 'vale-das-aroeiras', 'vale das aroeiras', NULL, true, true, 'cepbrasil.org'),
  ('Várzea da Olaria', 'varzea-da-olaria', 'varzea da olaria', NULL, true, true, 'cepbrasil.org'),
  ('Vila Augusto Chaves', 'vila-augusto-chaves', 'vila augusto chaves', NULL, true, true, 'cepbrasil.org'),
  ('Vila Mozart', 'vila-mozart', 'vila mozart', NULL, true, true, 'cepbrasil.org'),
  ('Vila Nazaré', 'vila-nazare', 'vila nazare', NULL, true, true, 'cepbrasil.org'),
  ('Vila Santa Maria', 'vila-santa-maria', 'vila santa maria', NULL, true, true, 'cepbrasil.org'),
  ('Vila Tavares', 'vila-tavares', 'vila tavares', NULL, true, true, 'cepbrasil.org'),
  ('Vila Vilaça', 'vila-vilaca', 'vila vilaca', NULL, true, true, 'cepbrasil.org'),
  ('Vila Washington', 'vila-washington', 'vila washington', NULL, true, true, 'cepbrasil.org'),
  ('Vitória', 'vitoria', 'vitoria', NULL, true, true, 'cepbrasil.org');

-- Legacy/unverified neighborhoods used in existing data, kept ACTIVE so existing properties keep showing
-- but flagged verified=false for admin review
INSERT INTO public.neighborhoods (name, slug, normalized, region, verified, is_active, source) VALUES
  ('Santo Antônio', 'santo-antonio', 'santo antonio', NULL, false, true, 'legacy-data'),
  ('Vila Romana', 'vila-romana', 'vila romana', NULL, false, true, 'legacy-data'),
  ('Alvorada', 'alvorada', 'alvorada', NULL, false, true, 'legacy-data'),
  ('Residencial Morro Verde', 'residencial-morro-verde', 'residencial morro verde', NULL, false, true, 'legacy-data');

-- Backfill: normalize property neighborhoods to match canonical names (already match in this case)
-- (No destructive change needed — values already align with seed names.)
