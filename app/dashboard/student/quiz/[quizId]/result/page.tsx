// app/dashboard/student/quiz/[quizId]/result/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Trophy, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react'
import MarkdownViewer from '@/components/markdown-viewer'

interface PageProps { params: Promise<{ quizId: string }> }

export default async function QuizResultPage({ params }: PageProps) {
  const { quizId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil Data Percobaan (Attempt) Siswa
  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select(`
        *,
        quizzes ( title, passing_score, modules(classroom_id) )
    `)
    .eq('quiz_id', quizId)
    .eq('student_id', user?.id)
    .order('completed_at', { ascending: false }) // Ambil yang paling baru
    .limit(1)
    .single()

  // Jika belum pernah mengerjakan, tendang balik ke halaman start
  if (!attempt) {
      redirect(`/dashboard/student/quiz/${quizId}/take`)
  }

  // 2. Ambil Soal & Opsi Lengkap (Untuk Review Pembahasan)
  const { data: questions } = await supabase
    .from('questions')
    .select(`
        *,
        options (id, option_text, is_correct)
    `)
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: true }) // Sesuaikan dengan urutan saat mengerjakan

  // Helper Variables
  const quiz = attempt.quizzes
  const isPassed = attempt.score >= quiz.passing_score
  const userAnswers = attempt.answers || {} // JSON: { questionId: { answer: "...", isCorrect: true/false } }

  // Hitung Benar/Salah
  const totalQuestions = questions?.length || 0
  const correctCount = Object.values(userAnswers).filter((a: any) => a.isCorrect).length
  const wrongCount = totalQuestions - correctCount

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 pb-20">
      
      {/* 1. HEADER NILAI (SCORE CARD) */}
      <div className={`rounded-3xl p-8 text-center text-white shadow-xl overflow-hidden relative ${isPassed ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-rose-700'}`}>
         {/* Background Pattern */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <Trophy size={300} className="absolute -right-10 -bottom-10 rotate-12"/>
         </div>

         <div className="relative z-10">
             <p className="text-white/80 font-bold tracking-widest uppercase text-sm mb-2">Nilai Akhir Anda</p>
             <h1 className="text-8xl font-black mb-4 tracking-tighter">{attempt.score}</h1>
             
             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
                 {isPassed ? <CheckCircle size={20} /> : <XCircle size={20} />}
                 <span className="font-bold text-lg">{isPassed ? 'LULUS (Passed)' : 'TIDAK LULUS (Failed)'}</span>
             </div>

             <div className="grid grid-cols-3 gap-4 mt-8 max-w-sm mx-auto">
                 <div className="bg-black/20 rounded-xl p-3">
                     <p className="text-xs opacity-75 uppercase">Soal</p>
                     <p className="font-bold text-xl">{totalQuestions}</p>
                 </div>
                 <div className="bg-black/20 rounded-xl p-3">
                     <p className="text-xs opacity-75 uppercase">Benar</p>
                     <p className="font-bold text-xl text-green-300">{correctCount}</p>
                 </div>
                 <div className="bg-black/20 rounded-xl p-3">
                     <p className="text-xs opacity-75 uppercase">Salah</p>
                     <p className="font-bold text-xl text-red-300">{wrongCount}</p>
                 </div>
             </div>
         </div>
      </div>

      {/* 2. TOMBOL AKSI */}
      <div className="flex gap-3 justify-center">
          <Link 
            href={`/dashboard/student/class/${quiz.modules.classroom_id}`}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
          >
              <ArrowLeft size={18} /> Kembali ke Kelas
          </Link>
          
          {/* Tombol Ulangi (Opsional, nanti bisa kita limit jika perlu) */}
          <form action={async () => {
              'use server'
              const supabase = await createClient()
              // Logic Reset: Hapus attempt lama biar bisa tes lagi
              await supabase.from('quiz_attempts').delete().eq('id', attempt.id)
              redirect(`/dashboard/student/quiz/${quizId}/take`)
          }}>
             <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors">
                 <RefreshCw size={18} /> Ulangi Ujian
             </button>
          </form>
      </div>

      <hr className="border-slate-200" />

      {/* 3. REVIEW PEMBAHASAN */}
      <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle className="text-indigo-600" /> Pembahasan Jawaban
          </h2>

          <div className="space-y-6">
              {questions?.map((q, idx) => {
                  const userAnswerData = userAnswers[q.id] // { answer: "...", isCorrect: bool }
                  const myAnswer = userAnswerData?.answer || '(Tidak dijawab)'
                  const isCorrect = userAnswerData?.isCorrect || false
                  
                  // Cari Jawaban Benar (Untuk ditampilkan jika salah)
                  let correctAnswerText = ''
                  if (q.question_type === 'short_answer') {
                      correctAnswerText = q.options?.[0]?.option_text // Kunci jawaban isian
                  } else {
                      const correctOpt = q.options?.find((o: any) => o.is_correct)
                      correctAnswerText = correctOpt?.option_text || 'Error: Kunci tidak ditemukan'
                  }

                  return (
                      <div key={q.id} className={`border rounded-xl p-6 transition-all ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                          <div className="flex gap-3 mb-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {idx + 1}
                              </div>
                              <div className="prose prose-sm max-w-none text-slate-800">
                                  <MarkdownViewer content={q.question_text} />
                              </div>
                          </div>

                          <div className="pl-11 space-y-2">
                              {/* Jawaban Siswa */}
                              <div className="text-sm">
                                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Jawaban Kamu:</span>
                                  <div className={`flex items-center gap-2 font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                      {isCorrect ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                      {myAnswer}
                                  </div>
                              </div>

                              {/* Kunci Jawaban (Hanya muncul jika salah) */}
                              {!isCorrect && (
                                  <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-sm">
                                      <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Kunci Jawaban Benar:</span>
                                      <div className="text-slate-800 font-bold flex items-center gap-2">
                                          <CheckCircle size={16} className="text-green-600" />
                                          {correctAnswerText}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>
    </div>
  )
}