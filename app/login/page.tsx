// app/login/page.tsx
'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError('')
    
    const res = await loginAction(formData)
    
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      // Refresh router untuk memicu middleware
      router.refresh() 
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg border border-slate-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            SigMathKing
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Masuk untuk mulai belajar Matematika
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                placeholder="Alamat Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                placeholder="Kata Sandi"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}