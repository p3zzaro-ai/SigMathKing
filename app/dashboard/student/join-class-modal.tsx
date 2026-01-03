// app/dashboard/student/join-class-modal.tsx
'use client'

import { useState } from 'react'
import { joinClassroomAction } from '@/app/actions/student'
import { Plus, X, Search } from 'lucide-react'

export default function JoinClassModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await joinClassroomAction(formData)
    setLoading(false)

    if (result?.error) {
      alert(result.error)
    } else {
      setIsOpen(false)
      // Opsional: alert('Berhasil bergabung!')
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm font-medium transition-all"
      >
        <Plus size={18} /> Gabung Kelas Baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                    <Search size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Gabung Kelas</h2>
                <p className="text-sm text-slate-500">Masukkan kode unik yang diberikan guru.</p>
            </div>

            <form action={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Kode Kelas</label>
                  <input 
                    name="code" 
                    required 
                    placeholder="Contoh: MATH-X123" 
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-lg font-mono font-bold text-center uppercase focus:border-indigo-500 focus:ring-0 outline-none placeholder:font-sans placeholder:text-sm placeholder:font-normal" 
                  />
               </div>

               <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                 {loading ? 'Mencari Kelas...' : 'Gabung Sekarang'}
               </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}