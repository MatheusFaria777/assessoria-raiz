import { useState } from 'react'
import { toast } from '../lib/toast'

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || 'Erro ao fazer login')
      localStorage.setItem('raiz_token', data.access_token)
      localStorage.setItem('raiz_user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#162d26',
    }}>
      <div style={{
        background: '#1E3D34', border: '1px solid rgba(245,245,245,.1)',
        borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 400,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, background: '#CBA135', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 auto 1rem',
          }}>R</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F5F5F5' }}>Sistema Raiz</div>
          <div style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.4)', marginTop: '.25rem' }}>Assessoria Raiz</div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" autoComplete="email" />
          </div>
          <div className="field">
            <label className="label">Senha</label>
            <input className="input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem', padding: '.75rem' }}>
            {loading ? <span className="spinner" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
