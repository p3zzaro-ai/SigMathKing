'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitQuiz(assignmentId: string, studentAnswers: Record<string, string>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // 1. Ambil KUNCI JAWABAN
  const { data: assignment } = await supabase
    .from('assignments')
    .select('content')
    .eq('id', assignmentId)
    .single()

  if (!assignment) return { error: 'Soal tidak ditemukan' }

  const questions = assignment.content
  let correctCount = 0
  const totalQuestions = questions.length

  // 2. Hitung Nilai
  questions.forEach((q: any, index: number) => {
    const userAnswer = studentAnswers[index] || ""
    const correctAnswer = q.correct
    if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      correctCount++
    }
  })

  const finalScore = Math.round((correctCount / totalQuestions) * 100)

  // 3. Simpan Nilai
  const { error } = await supabase
    .from('submissions')
    .insert({
      user_id: user.id,
      assignment_id: assignmentId,
      score: finalScore,
      answers: studentAnswers,
      status: 'graded'
    })

  if (error) {
    console.error(error)
    return { error: 'Gagal menyimpan nilai' }
  }

  // --- FITUR BARU: GAMIFICATION LOGIC ---
  
  // A. Badge "First Step" (Kuis Pertama)
  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  // Jika ini kuis pertama (count == 1 karena baru saja diinsert)
  if (count === 1) {
    await assignBadge(user.id, 'First Step')
  }

  // B. Badge "Math Wizard" (Nilai 100)
  if (finalScore === 100) {
    await assignBadge(user.id, 'Math Wizard')
  }

  revalidatePath('/student/assignments')
  redirect('/student/assignments')
}

// Helper Function: Berikan badge ke user (Cek nama badge di DB)
async function assignBadge(userId: string, badgeName: string) {
  const supabase = await createClient()
  
  // 1. Cari ID badge berdasarkan nama
  const { data: badge } = await supabase
    .from('badges')
    .select('id')
    .eq('name', badgeName)
    .single()
    
  if (badge) {
    // 2. Insert ke user_badges (Ignore jika sudah punya)
    await supabase
      .from('user_badges')
      .upsert({ user_id: userId, badge_id: badge.id }, { onConflict: 'user_id, badge_id' })
  }
}