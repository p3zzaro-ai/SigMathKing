// app/dashboard/student/class/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Lock, PlayCircle, BrainCircuit } from 'lucide-react' // Tambah Icon BrainCircuit

interface PageProps { params: Promise<{ id: string }> }

export default async function StudentClassDetail({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Ambil Detail Kelas
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('*, profiles:teacher_id(full_name)')
    .eq('id', id)
    .single()

  if (!classroom) return notFound()

  // 2. Ambil Modul & Item
  // PENTING: Tambahkan 'content' di select module_items untuk ambil quiz_id
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      module_items (
        id, title, type, is_locked, order, content
      )
    `)
    .eq('classroom_id', id)
    .order('order', { ascending: true })

  // Sort item manual (karena order di module_items kadang perlu disort di sisi client jika query nested terbatas)
  modules?.forEach(m => {
    if(m.module_items) {
      m.module_items.sort((a: any, b: any) => a.order - b.order)
    }
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header Kelas */}
      <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <Link href="/dashboard/student" className="inline-flex items-center gap-2 text-indigo-100 hover:text-white mb-4 text-sm transition-colors">
            <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold mb-2">{classroom.name}</h1>
        <p className="text-indigo-100 mb-4">{classroom.description || 'Selamat belajar!'}</p>
        
        <div className="flex items-center gap-4 text-xs font-mono bg-indigo-700/50 w-fit px-4 py-2 rounded-lg">
            <span>GURU: {classroom.profiles?.full_name}</span>
            <span className="w-px h-3 bg-indigo-400"></span>
            <span>LEVEL: {classroom.level}</span>
        </div>
      </div>

      {/* List Modul (Accordion Style) */}
      <div className="space-y-6">
        {modules?.length === 0 && (
            <div className="text-center py-10 text-slate-400 italic">
                Guru belum mengupload materi apapun.
            </div>
        )}

        {modules?.map((module) => (
            <div key={module.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <BookOpen size={20} className="text-indigo-600" />
                    <h3 className="font-bold text-slate-800">{module.title}</h3>
                </div>
                
                <div className="divide-y divide-slate-50">
                    {module.module_items.length === 0 && (
                        <p className="px-6 py-4 text-xs text-slate-400">Belum ada item di bab ini.</p>
                    )}

                    {module.module_items.map((item: any) => {
                        const isLocked = item.is_locked
                        const isQuiz = item.type === 'quiz'
                        
                        // Tentukan URL tujuan:
                        // Jika Kuis -> ke halaman /take
                        // Jika Materi -> ke halaman /learn
                        let hrefUrl = '#'
                        if (!isLocked) {
                            if (isQuiz && item.content?.quiz_id) {
                                hrefUrl = `/dashboard/student/quiz/${item.content.quiz_id}/take`
                            } else {
                                hrefUrl = `/dashboard/student/class/${id}/learn/${item.id}`
                            }
                        }

                        // 1. Tentukan Style CSS
                        const baseClasses = "flex items-center justify-between px-6 py-4 transition-all"
                        const activeClasses = isLocked 
                            ? 'bg-slate-50/50 cursor-not-allowed opacity-75' 
                            : 'hover:bg-indigo-50 cursor-pointer'

                        // 2. Ikon & Label yang dinamis
                        const Icon = isLocked ? Lock : (isQuiz ? BrainCircuit : PlayCircle)
                        const subLabel = isLocked ? 'Materi Terkunci' : (isQuiz ? 'Kuis Online' : 'Video & Pembahasan')
                        const btnLabel = isQuiz ? 'Mulai Kuis' : 'Mulai Belajar'
                        const iconColor = isLocked ? 'bg-slate-200 text-slate-500' : (isQuiz ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600')
                        const btnColor = isQuiz ? 'text-purple-600 bg-purple-50' : 'text-indigo-600 bg-indigo-50'

                        // 3. Buat Konten Dalam Kartu
                        const InnerContent = (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${iconColor}`}>
                                        <Icon size={16} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-medium ${isLocked ? 'text-slate-500' : 'text-slate-700'}`}>
                                                {item.title}
                                            </p>
                                            {/* Badge Kuis Kecil */}
                                            {isQuiz && !isLocked && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">KUIS</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {subLabel}
                                        </p>
                                    </div>
                                </div>

                                {!isLocked && (
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${btnColor}`}>
                                        {btnLabel}
                                    </span>
                                )}
                            </>
                        )

                        // 4. Render Link atau Div
                        if (isLocked) {
                            return (
                                <div key={item.id} className={`${baseClasses} ${activeClasses}`}>
                                    {InnerContent}
                                </div>
                            )
                        }

                        return (
                            <Link 
                                key={item.id}
                                href={hrefUrl}
                                className={`${baseClasses} ${activeClasses}`}
                            >
                                {InnerContent}
                            </Link>
                        )
                    })}
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}