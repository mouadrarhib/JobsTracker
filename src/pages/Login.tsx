import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signIn' | 'signUp'

const inputClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmEmail' | 'error'>('idle')
  const [error, setError] = useState('')

  const switchMode = (next: Mode) => {
    setMode(next)
    setStatus('idle')
    setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setStatus('submitting')
    setError('')
    try {
      if (mode === 'signIn') {
        await signIn(email.trim(), password)
      } else {
        const { needsEmailConfirmation } = await signUp(email.trim(), password)
        if (needsEmailConfirmation) {
          setStatus('confirmEmail')
          return
        }
      }
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-xl2 border border-white/10 bg-ink-soft p-8 shadow-panel">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-saffron">
            <span className="h-3.5 w-3.5 rounded-full bg-saffron" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-paper">Masār</p>
            <p className="text-[11px] uppercase tracking-wide text-paper/50">Job search log</p>
          </div>
        </div>

        {status === 'confirmEmail' ? (
          <div>
            <p className="font-display text-base font-semibold text-paper">Check your email</p>
            <p className="mt-2 text-sm text-paper/60">
              We sent a confirmation link to <span className="text-paper/90">{email}</span>. Confirm it, then sign
              in below.
            </p>
            <button
              onClick={() => switchMode('signIn')}
              className="mt-5 text-xs font-medium text-paper/50 hover:text-paper/80"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="font-display text-base font-semibold text-paper">
              {mode === 'signIn' ? 'Sign in' : 'Create your account'}
            </p>
            <p className="mt-1 text-sm text-paper/60">
              {mode === 'signIn' ? 'Welcome back.' : 'One account, private to you.'}
            </p>

            <label className="mt-5 block">
              <span className="text-xs font-medium text-paper/60">Email</span>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-medium text-paper/60">Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </label>

            {status === 'error' && <p className="mt-3 text-xs text-red">{error}</p>}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-5 w-full rounded-lg bg-saffron px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-saffron/90 disabled:opacity-60"
            >
              {status === 'submitting'
                ? mode === 'signIn'
                  ? 'Signing in…'
                  : 'Creating account…'
                : mode === 'signIn'
                  ? 'Sign in'
                  : 'Create account'}
            </button>

            <button
              type="button"
              onClick={() => switchMode(mode === 'signIn' ? 'signUp' : 'signIn')}
              className="mt-4 w-full text-xs font-medium text-paper/50 hover:text-paper/80"
            >
              {mode === 'signIn' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
