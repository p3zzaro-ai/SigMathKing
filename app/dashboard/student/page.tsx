// app/dashboard/student/page.tsx
import { createClient } from '@/utils/supabase/server'
import JoinClassModal from './join-class-modal'
import { BookOpen, User, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Ambil kelas yang diikuti siswa
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
        *,
        classrooms (
            id, name, description, level, teacher_id, code,
            profiles:teacher_id (full_name)
        )
    `)
    .eq('student_id', user?.id)
    .order('joined_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Halo, Semangat Belajar! 👋</h1>
            <p className="text-slate-500">Lanjutkan progres belajarmu hari ini.</p>
        </div>
        <JoinClassModal />
      </div>

      {/* Grid Kelas */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600"/> Kelas Saya
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments?.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-slate-500 mb-2">Kamu belum bergabung di kelas manapun.</p>
                    <p className="text-sm text-slate-400">Klik tombol "Gabung Kelas Baru" di atas.</p>
                </div>
            )}

            {enrollments?.map((en: any) => {
                const cls = en.classrooms
                return (
                    <Link 
                        key={en.id} 
                        href={`/dashboard/student/class/${cls.id}`}
                        className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all overflow-hidden flex flex-col h-full"
                    >
                        <div className="h-2 bg-indigo-500 w-full" /> {/* Strip warna atas */}
                        
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">
                                    {cls.level || 'Umum'}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                {cls.name}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                {cls.description || 'Tidak ada deskripsi.'}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-4 mt-auto">
                                <User size={14} />
                                <span>Guru: {cls.profiles?.full_name || 'Tanpa Nama'}</span>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
      </div>
    </div>
  )
}