-- ═══════════════════════════════════════════════════════════════════
-- QUADERNO DI CAMPAGNA — Schema SQL per Supabase
-- Copia e incolla questo nell'SQL Editor di Supabase
-- ═══════════════════════════════════════════════════════════════════

-- Abilita l'estensione UUID
create extension if not exists "uuid-ossp";

-- ─── ANAGRAFICA AZIENDA ─────────────────────────────────────────────
create table if not exists anagrafica (
  id uuid primary key default uuid_generate_v4(),
  nome_azienda text,
  proprietario text,
  indirizzo text,
  comune text default 'Rocca Imperiale',
  provincia text default 'CS',
  telefono text,
  email text,
  piva text,
  cuaa text,
  superficie_totale numeric,
  superficie_agrumeto numeric,
  num_piante integer,
  varieta text default 'Limone di Rocca Imperiale IGP',
  sistema_irrigazione text,
  certificazioni text default 'IGP',
  note text,
  created_at timestamptz default now()
);

-- ─── LAVORAZIONI ────────────────────────────────────────────────────
create table if not exists lavorazioni (
  id uuid primary key default uuid_generate_v4(),
  data date not null,
  appezzamento text,
  tipo_lavorazione text,
  operatore text,
  mezzo text,
  ore_lavorate numeric,
  carburante_litri numeric,
  costo numeric,
  note text,
  created_at timestamptz default now()
);

-- ─── TRATTAMENTI FITOSANITARI ────────────────────────────────────────
create table if not exists trattamenti (
  id uuid primary key default uuid_generate_v4(),
  data date not null,
  coltura text default 'Limone',
  prodotto text not null,
  principio_attivo text,
  dose text,
  acqua_litri_ha numeric,
  motivazione text,
  operatore text,
  carenza_giorni integer,
  meteo text,
  lotto_prodotto text,
  fornitore text,
  costo numeric,
  note text,
  created_at timestamptz default now()
);

-- ─── CONCIMAZIONI ───────────────────────────────────────────────────
create table if not exists concimazioni (
  id uuid primary key default uuid_generate_v4(),
  data date not null,
  tipo_concime text,
  quantita numeric,
  unita text default 'kg',
  metodo_distribuzione text,
  zona text,
  operatore text,
  npk text,
  costo numeric,
  note text,
  created_at timestamptz default now()
);

-- ─── MAGAZZINO ──────────────────────────────────────────────────────
create table if not exists magazzino (
  id uuid primary key default uuid_generate_v4(),
  nome_prodotto text not null,
  categoria text,
  quantita_disponibile numeric,
  unita text,
  quantita_minima numeric,
  prezzo_acquisto numeric,
  fornitore text,
  scadenza date,
  lotto text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── SPESE ──────────────────────────────────────────────────────────
create table if not exists spese (
  id uuid primary key default uuid_generate_v4(),
  data date not null,
  categoria text,
  descrizione text,
  fornitore text,
  metodo_pagamento text,
  numero_fattura text,
  fattura boolean default false,
  iva_pct numeric default 22,
  imponibile numeric,
  totale numeric,
  note text,
  created_at timestamptz default now()
);

-- ─── ENTRATE ────────────────────────────────────────────────────────
create table if not exists entrate (
  id uuid primary key default uuid_generate_v4(),
  data date not null,
  cliente text,
  quantita_kg numeric,
  prezzo_al_kg numeric,
  destinazione text,
  fatturato boolean default false,
  totale numeric,
  metodo_pagamento text,
  note text,
  created_at timestamptz default now()
);

-- ─── PRODUZIONE ─────────────────────────────────────────────────────
create table if not exists produzione (
  id uuid primary key default uuid_generate_v4(),
  data_raccolta date not null,
  appezzamento text,
  quantita_kg numeric,
  qualita text,
  destinazione text,
  prezzo_medio numeric,
  ricavo_totale numeric,
  note text,
  created_at timestamptz default now()
);

-- ─── SCADENZARIO ────────────────────────────────────────────────────
create table if not exists scadenzario (
  id uuid primary key default uuid_generate_v4(),
  scadenza date not null,
  tipo_attivita text,
  descrizione text,
  priorita text default 'MEDIA',
  stato text default 'In attesa',
  responsabile text,
  note text,
  created_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY (opzionale, per multi-utente) ───────────────
alter table lavorazioni enable row level security;
alter table trattamenti enable row level security;
alter table concimazioni enable row level security;
alter table magazzino enable row level security;
alter table spese enable row level security;
alter table entrate enable row level security;
alter table produzione enable row level security;
alter table scadenzario enable row level security;

-- Policy: accesso pubblico per ora (modifica per multi-tenant)
create policy "public access" on lavorazioni for all using (true) with check (true);
create policy "public access" on trattamenti for all using (true) with check (true);
create policy "public access" on concimazioni for all using (true) with check (true);
create policy "public access" on magazzino for all using (true) with check (true);
create policy "public access" on spese for all using (true) with check (true);
create policy "public access" on entrate for all using (true) with check (true);
create policy "public access" on produzione for all using (true) with check (true);
create policy "public access" on scadenzario for all using (true) with check (true);
create policy "public access" on anagrafica for all using (true) with check (true);

-- ─── DATI DI ESEMPIO ────────────────────────────────────────────────
insert into anagrafica (nome_azienda, proprietario, comune, varieta, superficie_agrumeto, num_piante)
values ('Azienda Agrumeto IGP', 'Mario Rossi', 'Rocca Imperiale', 'Limone di Rocca Imperiale IGP', 2.5, 400);

insert into scadenzario (scadenza, tipo_attivita, descrizione, priorita, stato)
values 
  (current_date + 7,  'Trattamento fitosanitario', 'Trattamento preventivo cocciniglie', 'URGENTE', 'In attesa'),
  (current_date + 14, 'Concimazione',              'Concimazione azotata post-fioritura', 'MEDIA',   'In attesa'),
  (current_date + 30, 'Pagamento fornitore',        'Saldo fattura fitofarmaci',           'URGENTE', 'In attesa');

insert into magazzino (nome_prodotto, categoria, quantita_disponibile, unita, quantita_minima, fornitore)
values
  ('Rame ossicloruro',     'Fitofarmaci', 15, 'kg', 5,  'Agriforniture Sud'),
  ('Zolfo bagnabile',      'Fitofarmaci', 20, 'kg', 5,  'Agriforniture Sud'),
  ('Nitrato ammonico',     'Concimi',     50, 'kg', 20, 'Consorzio Agrario'),
  ('Gasolio agricolo',     'Carburante', 200, 'L',  50, 'ENI Agri'),
  ('Sacchi raccolta 10kg', 'Packaging',  500, 'pz', 100,'Imballaggi Calabria');
