import { useState } from 'react'
import { auth } from '../lib/auth'
import { Eye, EyeOff, Leaf } from 'lucide-react'

export default function Login({ onLogin }) {
  const [mode, setMode]       = useState('login') // 'login' | 'register' | 'reset'
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [nome, setNome]       = useState('')
  const [showPass, setShowP]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const reset = () => { setError(''); setSuccess('') }

  const handleLogin = async (e) => {
    e.preventDefault(); reset(); setLoading(true)
    try {
      await auth.signIn(email, password)
      onLogin()
    } catch(err) {
      setError(translateError(err.message))
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); reset(); setLoading(true)
    if (password.length < 6) { setError('La password deve avere almeno 6 caratteri'); setLoading(false); return }
    try {
      await auth.signUp(email, password, nome)
      setSuccess('Account creato! Controlla la tua email per confermare la registrazione.')
      setMode('login')
    } catch(err) {
      setError(translateError(err.message))
    } finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault(); reset(); setLoading(true)
    try {
      await auth.resetPassword(email)
      setSuccess('Email inviata! Controlla la tua casella per reimpostare la password.')
    } catch(err) {
      setError(translateError(err.message))
    } finally { setLoading(false) }
  }

  const translateError = (msg) => {
    if (msg.includes('Invalid login')) return 'Email o password non corretti'
    if (msg.includes('Email not confirmed')) return 'Devi confermare la tua email prima di accedere'
    if (msg.includes('already registered')) return 'Questa email è già registrata'
    if (msg.includes('rate limit')) return 'Troppi tentativi, riprova tra qualche minuto'
    return msg
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-verde-700 via-verde-600 to-verde-800 p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/4 text-[200px] opacity-5 select-none">🍋</div>
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-limone-300 shadow-lg mb-4">
            <span className="text-3xl">🍋</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Quaderno di Campagna</h1>
          <p className="text-verde-200 text-sm mt-1">Limone di Rocca Imperiale IGP</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); reset() }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${mode === m ? 'bg-white text-verde-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {error   && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="mario@esempio.it"
                  value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input pr-10" type={showPass ? 'text' : 'password'}
                    placeholder="••••••••" value={password} onChange={e=>setPass(e.target.value)} required />
                  <button type="button" onClick={() => setShowP(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base">
                {loading ? 'Accesso in corso…' : 'Accedi'}
              </button>
              <button type="button" onClick={() => { setMode('reset'); reset() }}
                className="w-full text-center text-xs text-gray-400 hover:text-verde-600 transition-colors mt-2">
                Password dimenticata?
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label">Nome completo</label>
                <input className="input" type="text" placeholder="Mario Rossi"
                  value={nome} onChange={e=>setNome(e.target.value)} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="mario@esempio.it"
                  value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password <span className="text-gray-400 font-normal">(min. 6 caratteri)</span></label>
                <div className="relative">
                  <input className="input pr-10" type={showPass ? 'text' : 'password'}
                    placeholder="••••••••" value={password} onChange={e=>setPass(e.target.value)} required />
                  <button type="button" onClick={() => setShowP(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base">
                {loading ? 'Registrazione…' : 'Crea account'}
              </button>
            </form>
          )}

          {/* RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-gray-500 mb-2">Inserisci la tua email e ti mandiamo un link per reimpostare la password.</p>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="mario@esempio.it"
                  value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base">
                {loading ? 'Invio in corso…' : 'Invia link reset'}
              </button>
              <button type="button" onClick={() => { setMode('login'); reset() }}
                className="w-full text-center text-xs text-gray-400 hover:text-verde-600 transition-colors">
                ← Torna al login
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-verde-300 text-xs mt-6">
          © {new Date().getFullYear()} Quaderno di Campagna — Tutti i diritti riservati
        </p>
      </div>
    </div>
  )
}
