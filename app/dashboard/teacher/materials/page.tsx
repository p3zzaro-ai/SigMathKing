// app/dashboard/teacher/materials/page.tsx
import { createClient } from '@/utils/supabase/server'
import { GraduationCap, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function MaterialsLevelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Ambil data untuk menghitung jumlah kelas
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('level')
    .eq('teacher_id', user?.id)

  const counts = { X: 0, XI: 0, XII: 0 }
  classrooms?.forEach(c => {
      const lvl = (c.level || 'X') as keyof typeof counts
      if(counts[lvl] !== undefined) counts[lvl]++
  })

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Materi Pembelajaran</h1>
            <p className="text-slate-500">Pilih tingkatan kelas untuk mengelola materi & bab.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['X', 'XI', 'XII'].map((level) => (
                <Link 
                    key={level} 
                    href={`/dashboard/teacher/materials/level/${level}`}
                    className="group bg-white hover:bg-indigo-600 transition-all p-6 rounded-xl border border-slate-200 hover:border-indigo-600 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between h-40"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-indigo-50 group-hover:bg-white/20 rounded-lg text-indigo-600 group-hover:text-white transition-colors">
                            <GraduationCap size={24} />
                        </div>
                        <span className="text-3xl font-black text-slate-200 group-hover:text-white/30 font-mono">
                            {level}
                        </span>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-white">Kelas {level}</h3>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-slate-500 group-hover:text-indigo-100">
                                {counts[level as keyof typeof counts]} Kelas Aktif
                            </p>
                            <ChevronRight className="text-slate-300 group-hover:text-white" size={20} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  )
}