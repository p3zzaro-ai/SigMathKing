// app/dashboard/teacher/materials/level/[level]/page.tsx
import { createClient } from '@/utils/supabase/server'
// Import Component Baru
import { CreateClassButton, EditClassButton } from './class-actions' 
import { Users, BookOpen, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { deleteClassroomAction } from '@/app/actions/teacher'

interface PageProps { params: Promise<{ level: string }> }

export default async function MaterialsClassListPage({ params }: PageProps) {
  const { level } = await params
  if (!['X', 'XI', 'XII'].includes(level)) redirect('/dashboard/teacher')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('*, enrollments(count)') 
    .eq('teacher_id', user?.id)
    .eq('level', level) 
    .order('name', { ascending: true }) 

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/teacher/materials" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 text-sm w-fit">
            <ArrowLeft size={16} /> Kembali
        </Link>
        
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Materi - Tingkat {level}</h1>
                <p className="text-slate-500">Pilih kelas untuk mengedit materi pelajaran.</p>
            </div>
            
            {/* GANTI DETAILS DENGAN TOMBOL MODAL BARU */}
            <CreateClassButton level={level} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms?.length === 0 && (
            <p className="col-span-full text-center text-slate-400 py-10 italic border-2 border-dashed border-slate-200 rounded-xl">
                Belum ada kelas. Silakan buat kelas baru.
            </p>
        )}

        {classrooms?.map((cls) => (
            <div key={cls.id} className="relative group bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all">
                
                <Link href={`/dashboard/teacher/class/${cls.id}`} className="block p-6 pb-16">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <BookOpen size={20} />
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-mono border border-slate-200">
                            {cls.code}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{cls.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{cls.description || 'Tidak ada deskripsi'}</p>
                </Link>

                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-b-xl">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Users size={16} />
                        <span>{cls.enrollments[0]?.count || 0} Siswa</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                         {/* TOMBOL EDIT BARU */}
                         <EditClassButton classroom={cls} />

                         <form action={async () => {
                            'use server'
                            await deleteClassroomAction(cls.id, level)
                        }}>
                            <button type="submit" className="text-slate-400 hover:text-red-600 p-2 z-10 relative" title="Hapus Kelas">
                                <Trash2 size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}