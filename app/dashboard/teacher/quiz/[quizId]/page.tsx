// app/dashboard/teacher/quiz/[quizId]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Award, Calculator } from 'lucide-react'
import QuestionForm from './question-form'
import QuizSettings from './quiz-settings'
import QuestionListItem from './question-list-item' // Import komponen item baru

interface PageProps { params: Promise<{ quizId: string }> }

export default async function QuizBuilderPage({ params }: PageProps) {
  const { quizId } = await params
  const supabase = await createClient()

  // 1. Ambil Detail Kuis
  const { data: quiz } = await supabase.from('quizzes').select('*, modules(classroom_id)').eq('id', quizId).single()
  if (!quiz) return notFound()

  // 2. Ambil Daftar Soal (Order by created_at sebagai default sorting)
  // Catatan: Jika ingin fitur reorder benar-benar presisi, sebaiknya nanti tambah kolom "order" di tabel questions.
  // Tapi action reorderQuestionAction kita tadi sudah manipulasi "created_at", jadi sort by created_at sudah cukup untuk simulasi urutan.
  const { data: questions } = await supabase
    .from('questions')
    .select(`*, options (id, option_text, is_correct)`)
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: true })

  // 3. Hitung Total Skor
  const totalScore = questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div>
        <Link href={`/dashboard/teacher/class/${quiz.modules.classroom_id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-4 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Kembali ke Materi
        </Link>
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold text-slate-900">{quiz.title}</h1>
                    <QuizSettings quiz={quiz} />
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={16}/> {quiz.duration} Menit</span>
                    <span className="flex items-center gap-1"><Award size={16}/> KKM: {quiz.passing_score}</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">{questions?.length || 0} Soal</span>
                    
                    {/* TOTAL SKOR */}
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                        <Calculator size={14}/> Total Bobot: {totalScore}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* LIST SOAL (Pakai Component Baru) */}
      <div className="space-y-4">
        {questions?.map((q, index) => (
            <QuestionListItem 
                key={q.id} 
                question={q} 
                index={index} 
                quizId={quizId} 
                totalQuestions={questions.length} 
            />
        ))}
        {questions?.length === 0 && (
            <div className="text-center py-10 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-6">
                Belum ada soal.
            </div>
        )}
      </div>

      {/* FORM TAMBAH SOAL */}
      <QuestionForm quizId={quizId} />
    </div>
  )
}