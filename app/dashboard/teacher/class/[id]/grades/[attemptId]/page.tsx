// app/dashboard/teacher/class/[id]/grades/[attemptId]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, User } from 'lucide-react'
import MarkdownViewer from '@/components/markdown-viewer'

interface PageProps { params: Promise<{ id: string, attemptId: string }> }

export default async function AttemptDetailPage({ params }: PageProps) {
  const { id: classId, attemptId } = await params
  const supabase = await createClient()

  // 1. Ambil Data Attempt + Profile Siswa + Info Kuis
  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select(`
        *,
        profiles:student_id(full_name, email),
        quizzes(title, passing_score)
    `)
    .eq('id', attemptId)
    .single()

  if (!attempt) return notFound()

  // 2. Ambil Soal untuk dicocokkan
  const { data: questions } = await supabase
    .from('questions')
    .select(`*, options(id, option_text, is_correct)`)
    .eq('quiz_id', attempt.quiz_id)
    .order('created_at', { ascending: true })

  const userAnswers = attempt.answers || {}

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 pb-20">
      
      <Link 
        href={`/dashboard/teacher/class/${classId}/grades`}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 text-sm font-medium"
      >
         <ArrowLeft size={16} /> Kembali ke Rekap Nilai
      </Link>

      {/* HEADER DETAIL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8 flex items-center justify-between">
         <div>
             <h1 className="text-xl font-bold text-slate-900 mb-1">{attempt.quizzes.title}</h1>
             <div className="flex items-center gap-2 text-sm text-slate-500">
                <User size={16} />
                <span>Siswa: <strong className="text-slate-800">{attempt.profiles.full_name}</strong></span>
             </div>
         </div>
         <div className="text-right">
             <div className="text-xs text-slate-400 uppercase font-bold mb-1">Nilai Akhir</div>
             <div className={`text-4xl font-black ${attempt.score >= attempt.quizzes.passing_score ? 'text-green-600' : 'text-red-500'}`}>
                 {attempt.score}
             </div>
         </div>
      </div>

      {/* LIST JAWABAN (AUDIT) */}
      <div className="space-y-6">
        {questions?.map((q, idx) => {
            const answerData = userAnswers[q.id]
            const myAnswer = answerData?.answer || '(Kosong)'
            const isCorrect = answerData?.isCorrect || false

            // Cari kunci
            let keyAnswer = ''
            if(q.question_type === 'short_answer') {
                keyAnswer = q.options?.[0]?.option_text
            } else {
                keyAnswer = q.options?.find((o:any) => o.is_correct)?.option_text
            }

            return (
                <div key={q.id} className={`border rounded-xl p-6 ${isCorrect ? 'bg-white border-slate-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex gap-3 mb-4">
                        <div className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                            {idx + 1}
                        </div>
                        <div className="prose prose-sm max-w-none text-slate-800">
                             <MarkdownViewer content={q.question_text} />
                        </div>
                    </div>

                    <div className="pl-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg border text-sm ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-slate-200 text-red-600'}`}>
                            <span className="block text-xs font-bold opacity-50 uppercase mb-1">Jawaban Siswa:</span>
                            <div className="flex items-center gap-2 font-bold">
                                {isCorrect ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                {myAnswer}
                            </div>
                        </div>

                        {!isCorrect && (
                            <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 text-slate-700 text-sm">
                                <span className="block text-xs font-bold opacity-50 uppercase mb-1">Kunci Jawaban:</span>
                                <div className="flex items-center gap-2 font-bold">
                                    <CheckCircle size={16} className="text-green-600"/>
                                    {keyAnswer}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>

    </div>
  )
}