// app/dashboard/student/quiz/[quizId]/take/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import QuizRunner from './quiz-runner'

interface PageProps { params: Promise<{ quizId: string }> }

export default async function TakeQuizPage({ params }: PageProps) {
  const { quizId } = await params
  const supabase = await createClient()

  // 1. Ambil Data Kuis
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
  if (!quiz) return notFound()

  // 2. Cek apakah siswa sudah pernah mengerjakan?
  const { data: { user } } = await supabase.auth.getUser()
  const { data: existingAttempt } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('quiz_id', quizId)
    .eq('student_id', user?.id)
    .single()
  
  if (existingAttempt) {
      // Jika sudah pernah, lempar ke halaman hasil
      redirect(`/dashboard/student/quiz/${quizId}/result`)
  }

  // 3. Ambil Soal (TANPA KUNCI JAWABAN)
  // Perhatikan select options: kita TIDAK mengambil 'is_correct'
  const { data: questions } = await supabase
    .from('questions')
    .select(`
        id, question_text, points, question_type,
        options (id, option_text) 
    `)
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: true }) // Atau gunakan 'order' jika sudah diperbaiki

  return (
    <QuizRunner quiz={quiz} questions={questions || []} />
  )
}