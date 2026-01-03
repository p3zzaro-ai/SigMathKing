// app/dashboard/teacher/class/[id]/grades/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, FileSpreadsheet, Eye } from 'lucide-react'

interface PageProps { params: Promise<{ id: string }> }

export default async function ClassGradesPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Ambil Data Kelas
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('name, level')
    .eq('id', id)
    .single()

  // 2. Ambil Daftar Siswa (Enrollments)
  const { data: students } = await supabase
    .from('enrollments')
    .select('student_id, profiles:student_id(full_name, email)')
    .eq('classroom_id', id)
    .order('joined_at', { ascending: true })

  // 3. Ambil Daftar Kuis di Kelas Ini
  // Kita perlu join: module_items -> modules -> classroom
  // Tapi lebih mudah query 'quizzes' yang punya relasi ke 'modules'
  // Cari semua module_id milik kelas ini dulu
  const { data: modules } = await supabase.from('modules').select('id').eq('classroom_id', id)
  const moduleIds = modules?.map(m => m.id) || []

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title, passing_score')
    .in('module_id', moduleIds)
    .order('created_at', { ascending: true })

  // 4. Ambil Semua Percobaan (Attempts) untuk kuis-kuis tersebut
  const quizIds = quizzes?.map(q => q.id) || []
  
  // Kita ambil attempt TERBAIK atau TERAKHIR per siswa per kuis
  // Untuk simpelnya, kita ambil semua, nanti di filter di JS
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id, student_id, quiz_id, score, created_at')
    .in('quiz_id', quizIds)

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div>
        <Link 
            href={`/dashboard/teacher/class/${id}`} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-4 text-sm font-medium transition-colors"
        >
            <ArrowLeft size={16} /> Kembali ke Kelas
        </Link>
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Rekap Nilai Siswa</h1>
                <p className="text-slate-500 mt-1">Kelas: {classroom?.name} ({classroom?.level})</p>
            </div>
            {/* Tombol Export (Placeholder) */}
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-sm opacity-50 cursor-not-allowed" title="Segera Hadir">
                <FileSpreadsheet size={16} /> Export Excel
            </button>
        </div>
      </div>

      {/* TABEL NILAI */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                      <th className="px-6 py-4 w-10">#</th>
                      <th className="px-6 py-4 min-w-[200px]">Nama Siswa</th>
                      
                      {/* Kolom Judul Kuis */}
                      {quizzes?.map((quiz) => (
                          <th key={quiz.id} className="px-6 py-4 text-center min-w-[120px]">
                              <div className="line-clamp-1" title={quiz.title}>{quiz.title}</div>
                              <div className="text-[10px] font-normal text-slate-400 mt-1">KKM: {quiz.passing_score}</div>
                          </th>
                      ))}
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {students?.map((student: any, idx) => (
                      <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="px-6 py-4">
                              <p className="font-bold text-slate-700">{student.profiles?.full_name || 'Tanpa Nama'}</p>
                              <p className="text-xs text-slate-400">{student.profiles?.email}</p>
                          </td>

                          {/* Render Nilai Per Kuis */}
                          {quizzes?.map((quiz) => {
                              // Cari attempt siswa ini untuk kuis ini
                              // Ambil nilai tertinggi jika ada multiple attempt
                              const studentAttempts = attempts?.filter(
                                  a => a.quiz_id === quiz.id && a.student_id === student.student_id
                              )
                              
                              // Sort descending by score
                              studentAttempts?.sort((a, b) => b.score - a.score)
                              const bestAttempt = studentAttempts?.[0]

                              return (
                                  <td key={quiz.id} className="px-6 py-4 text-center">
                                      {bestAttempt ? (
                                          <div className="flex flex-col items-center gap-1">
                                              <span className={`font-bold text-lg ${bestAttempt.score >= quiz.passing_score ? 'text-green-600' : 'text-red-500'}`}>
                                                  {bestAttempt.score}
                                              </span>
                                              
                                              <Link 
                                                href={`/dashboard/teacher/class/${id}/grades/${bestAttempt.id}`}
                                                className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                                              >
                                                  <Eye size={10} /> Detail
                                              </Link>
                                          </div>
                                      ) : (
                                          <span className="text-slate-300 text-xs italic">-</span>
                                      )}
                                  </td>
                              )
                          })}
                      </tr>
                  ))}

                  {students?.length === 0 && (
                      <tr>
                          <td colSpan={(quizzes?.length || 0) + 2} className="px-6 py-10 text-center text-slate-400">
                              Belum ada siswa yang bergabung di kelas ini.
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  )
}