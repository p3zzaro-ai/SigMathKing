// app/dashboard/teacher/materials/level/[level]/create-class-form.tsx
'use client'

import { createClassroomAction } from '@/app/actions/teacher'
import { useRef, useState } from 'react'

export default function CreateClassForm({ level }: { level: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await createClassroomAction(formData)
    setLoading(false)

    if (result?.error) {
      alert(result.error) 
    } else {
      formRef.current?.reset()
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
        <input type="hidden" name="level" value={level} /> 
        
        <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Kelas</label>
            <input 
                name="name" 
                placeholder={`Contoh: ${level}-A`} 
                required 
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>
        
        <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Deskripsi</label>
            <textarea 
                name="description" 
                placeholder="Deskripsi singkat..." 
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={2}
            ></textarea>
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
            {loading ? 'Menyimpan...' : 'Simpan Kelas'}
        </button>
    </form>
  )
}