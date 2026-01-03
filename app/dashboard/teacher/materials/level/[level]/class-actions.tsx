// app/dashboard/teacher/materials/level/[level]/class-actions.tsx
'use client'

import { useState } from 'react'
import { createClassroomAction, updateClassroomAction } from '@/app/actions/teacher'
import { Plus, X, Pencil } from 'lucide-react'

// --- COMPONENT 1: TOMBOL CREATE DENGAN MODAL ---
export function CreateClassButton({ level }: { level: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await createClassroomAction(formData)
    setLoading(false)

    if (result?.error) {
      alert(result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm font-medium text-sm"
      >
        <Plus size={16} /> Buat Kelas Baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900 mb-1">Buat Kelas Baru ({level})</h2>
            <p className="text-sm text-slate-500 mb-4">Silakan isi detail kelas di bawah ini.</p>

            <form action={handleSubmit} className="space-y-4">
               <input type="hidden" name="level" value={level} />
               
               <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelas</label>
                  <input name="name" required placeholder={`Contoh: ${level}-A`} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
               
               <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi</label>
                  <textarea name="description" rows={3} placeholder="Deskripsi singkat..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>

               <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
                 {loading ? 'Menyimpan...' : 'Simpan Kelas'}
               </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// --- COMPONENT 2: TOMBOL EDIT DENGAN MODAL ---
export function EditClassButton({ classroom }: { classroom: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await updateClassroomAction(formData)
    setLoading(false)

    if (result?.error) {
      alert(result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={(e) => {
            e.preventDefault() // Mencegah link parent terklik
            e.stopPropagation()
            setIsOpen(true)
        }}
        className="text-slate-400 hover:text-indigo-600 p-2 z-10 relative transition-colors"
        title="Edit Nama/Deskripsi"
      >
        <Pencil size={16} />
      </button>

      {isOpen && (
        <div 
            // PERBAIKAN: Hapus e.preventDefault() yang membunuh form
            // Ganti dengan stopPropagation agar klik di modal tidak tembus ke belakang
            onClick={(e) => e.stopPropagation()} 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-default"
        >
          {/* Tambahkan e.stopPropagation di sini juga untuk keamanan ganda */}
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Kelas</h2>

            <form action={handleSubmit} className="space-y-4">
               {/* PASTIKAN DATA HIDDEN INI BENAR */}
               <input type="hidden" name="classId" value={classroom.id} />
               <input type="hidden" name="level" value={classroom.level || 'X'} />
               
               <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelas</label>
                  <input name="name" defaultValue={classroom.name} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
               
               <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi</label>
                  <textarea name="description" defaultValue={classroom.description} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>

               {/* PERBAIKAN: Tambahkan type="submit" */}
               <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
                 {loading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
               </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}