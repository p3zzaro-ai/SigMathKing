// app/actions/student-quiz.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitQuizAction(quizId: string, answers: Record<string, string>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // 1. Ambil Kunci Jawaban dari Database (Server Side - Aman)
  const { data: questions } = await supabase
    .from('questions')
    .select(`
        id, points, question_type,
        options (id, option_text, is_correct)
    `)
    .eq('quiz_id', quizId)

  if (!questions) return { error: 'Soal tidak ditemukan' }

  // 2. Hitung Nilai
  let totalScore = 0
  let earnedScore = 0
  const detailAnswers: any = {} // Untuk disimpan di database

  questions.forEach((q) => {
      totalScore += (q.points || 0)
      
      const userAnswer = answers[q.id] // ID Opsi (untuk Pilgan) atau Teks (untuk Isian)
      let isCorrect = false

      if (q.question_type === 'short_answer') {
          // Logic Isian: Bandingkan teks (case insensitive)
          const key = q.options?.[0]?.option_text || ''
          if (userAnswer && userAnswer.trim().toLowerCase() === key.trim().toLowerCase()) {
              isCorrect = true
          }
          detailAnswers[q.id] = { answer: userAnswer, isCorrect }
      } else {
          // Logic Pilgan: Bandingkan ID Opsi
          // Cari opsi yang benar di DB
          const correctOption = q.options?.find((o: any) => o.is_correct)
          // Cari opsi yang dipilih user
          const selectedOption = q.options?.find((o: any) => o.option_text === userAnswer) // Client kirim teks opsi agar konsisten
          // ATAU, lebih aman client kirim ID. Mari kita asumsikan client kirim TEKS OPSI untuk simplifikasi Isian & Pilgan sama2 string.
          
          if (userAnswer === correctOption?.option_text) {
              isCorrect = true
          }
          detailAnswers[q.id] = { answer: userAnswer, isCorrect }
      }

      if (isCorrect) earnedScore += (q.points || 0)
  })

  // Hitung Nilai Akhir (Skala 0-100)
  // Rumus: (Skor Didapat / Total Skor) * 100
  const finalGrade = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0

  // 3. Simpan ke Database
  const { error } = await supabase
    .from('quiz_attempts')
    .insert({
        student_id: user.id,
        quiz_id: quizId,
        score: finalGrade,
        answers: detailAnswers,
        completed_at: new Date().toISOString()
    })

  if (error) return { error: error.message }

  // 4. Redirect ke Halaman Hasil
  revalidatePath(`/dashboard/student/quiz/${quizId}/result`)
  return { success: true, redirectUrl: `/dashboard/student/quiz/${quizId}/result` }
}