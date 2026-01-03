// app/dashboard/teacher/class/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ModuleList from './module-list' 
import { ArrowLeft, FileBarChart } from 'lucide-react' // [UPDATE] Tambah icon FileBarChart
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Ambil detail kelas
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', id)
    .single()

  if (!classroom) return notFound()

  // 2. Ambil modules + module_items untuk Course Builder
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      module_items (
        id, title, type, content, order, is_locked, is_published
      )
    `)
    .eq('classroom_id', id)
    .order('order', { ascending: true })

  // Sort items manual
  modules?.forEach(m => {
    if(m.module_items) {
      m.module_items.sort((a: any, b: any) => a.order - b.order)
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Area */}
      <div>
        <Link 
            // Link kembali ke LEVEL yang sesuai
            href={`/dashboard/teacher/materials/level/${classroom.level || 'X'}`} 
            className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-4 text-sm w-fit transition-colors"
        >
            <ArrowLeft size={16} /> Kembali ke List Kelas
        </Link>

        {/* [UPDATE] Tampilan Header Lebih Rapi dengan Tombol Rekap Nilai */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">{classroom.name}</h1>
                <p className="text-slate-500 mt-1 max-w-2xl">{classroom.description || 'Tidak ada deskripsi.'}</p>
                
                <div className="mt-4 flex flex-wrap gap-3">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-xs font-mono font-bold border border-indigo-200">
                        KODE: {classroom.code}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold border border-slate-200 uppercase">
                        TINGKAT: {classroom.level || 'X'}
                    </span>
                </div>
            </div>

            {/* [BARU] Tombol Menuju Gradebook */}
            <Link 
                href={`/dashboard/teacher/class/${id}/grades`}
                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
            >
                <FileBarChart size={18} /> Rekap Nilai Siswa
            </Link>
        </div>
      </div>

      {/* Course Builder Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-slate-800">Materi & Kuis</h2>
        </div>
        <ModuleList initialModules={modules || []} classroomId={id} />
      </section>
    </div>
  )
}