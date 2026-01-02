import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import QuizRunner from '@/components/student/QuizRunner'

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  // Karena params adalah Promise di Next.js 15, kita await dulu
  const { id } = await params

  // 1. Ambil data assignment
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !assignment) {
    return <div>Tugas tidak ditemukan.</div>
  }

  // 2. Sanitasi Data (HAPUS KUNCI JAWABAN) agar aman
  // Kita buat copy array baru tanpa properti "correct"
  const safeQuestions = assignment.content.map((q: any) => {
    const { correct, ...safeQ } = q // Destructuring untuk membuang 'correct'
    return safeQ
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{assignment.title}</h1>
      <QuizRunner 
        assignmentId={assignment.id} 
        questions={safeQuestions} 
        videoUrl={assignment.video_url}
      />
    </div>
  )
}