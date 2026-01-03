// app/onboarding/page.tsx
'use client'

import { completeOnboardingAction } from '@/app/actions/auth'
import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react' // Tambah icon Lock

export default function OnboardingPage() {
  const [role, setRole] = useState('student') 
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('') // State untuk error

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setErrorMsg('')
    
    // Panggil server action
    const result = await completeOnboardingAction(formData)
    
    // Jika ada error (misal kode guru salah), tampilkan
    if (result?.error) {
      setErrorMsg(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md border border-slate-100">
        <h1 className="text-2xl font-bold text-center mb-2">Lengkapi Data</h1>
        <p className="text-slate-500 text-center mb-6">Pastikan data sesuai dengan identitas sekolah.</p>

        <form action={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div className="flex gap-4 justify-center mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                role === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Saya Siswa
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                role === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Saya Guru
            </button>
            <input type="hidden" name="role" value={role} />
          </div>

          {/* INPUT KHUSUS GURU */}
          {role === 'teacher' && (
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200 animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-orange-800 flex items-center gap-2">
                <Lock size={16} /> Kode Akses Guru
              </label>
              <input 
                name="teacherCode" 
                type="password"
                required 
                className="mt-2 block w-full rounded-md border border-orange-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" 
                placeholder="Masukkan kode rahasia..." 
              />
              <p className="text-xs text-orange-600 mt-1">Hanya untuk guru yang terverifikasi.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input name="fullName" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Contoh: Budi Santoso" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">NIS / NIP</label>
            <input name="nis" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Nomor Induk" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Jenis Kelamin</label>
            <select name="gender" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          
          {/* Tampilkan Error jika ada */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Simpan & Lanjut'}
          </button>
        </form>
      </div>
    </div>
  )
}