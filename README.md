# 🍋 Quaderno di Campagna — Limone di Rocca Imperiale IGP

Gestionale agricolo professionale — React + Supabase + Vercel

---

## ✅ Database (già fatto)
Il database Supabase è già configurato e funzionante.

---

## 🚀 Come mettere online (GitHub + Vercel)

### PASSO 1 — Crea account GitHub
1. Vai su https://github.com
2. Clicca "Sign up" e crea un account gratuito

### PASSO 2 — Carica il codice su GitHub
1. Vai su https://github.com/new
2. Nome repository: `quaderno-campagna`
3. Lascia tutto il resto com'è e clicca "Create repository"
4. Segui le istruzioni per caricare i file (Upload files)

### PASSO 3 — Collega Vercel
1. Vai su https://vercel.com
2. Clicca "Sign up" → "Continue with GitHub"
3. Clicca "New Project"
4. Seleziona il repository `quaderno-campagna`
5. Nella sezione "Environment Variables" aggiungi:
   - Nome: `VITE_SUPABASE_URL`     → Valore: `https://ujqfwilmbldgjihnfnrf.supabase.co`
   - Nome: `VITE_SUPABASE_ANON_KEY` → Valore: la tua chiave
6. Clicca "Deploy"

Dopo 2 minuti il tuo gestionale è online! 🎉

---

## 📱 Funzionalità
- Dashboard con KPI e grafici
- Anagrafica azienda
- Registro lavorazioni
- Registro trattamenti fitosanitari (obbligatorio per legge)
- Registro concimazioni
- Magazzino con avvisi scorte
- Spese con calcolo IVA automatico
- Entrate e vendite
- Produzione e raccolta
- Scadenzario con avvisi automatici
