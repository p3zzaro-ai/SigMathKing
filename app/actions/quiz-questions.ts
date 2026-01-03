// app/actions/quiz-questions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. CREATE (SAMA SEPERTI SEBELUMNYA) ---
export async function createQuestionAction(formData: FormData) {
  const supabase = await createClient()
  const quizId = formData.get('quizId') as string
  const questionText = formData.get('questionText') as string
  const questionType = formData.get('questionType') as string
  const points = parseInt(formData.get('points') as string) || 10
  
  // 1. Simpan Pertanyaan
  const { data: question, error: qError } = await supabase
    .from('questions')
    .insert({
      quiz_id: quizId,
      question_text: questionText,
      points: points,
      question_type: questionType
    })
    .select()
    .single()

  if (qError) return { error: qError.message }

  // 2. Simpan Opsi (Helper Function di bawah)
  await handleSaveOptions(supabase, question.id, questionType, formData)

  revalidatePath(`/dashboard/teacher/quiz/${quizId}`)
  return { success: true }
}

// --- 2. UPDATE (BARU: EDIT SOAL) ---
export async function updateQuestionAction(formData: FormData) {
    const supabase = await createClient()
    const questionId = formData.get('questionId') as string
    const quizId = formData.get('quizId') as string
    const questionText = formData.get('questionText') as string
    const questionType = formData.get('questionType') as string
    const points = parseInt(formData.get('points') as string) || 10

    // 1. Update Pertanyaan Header
    const { error: qError } = await supabase
        .from('questions')
        .update({
            question_text: questionText,
            points: points,
            question_type: questionType
        })
        .eq('id', questionId)

    if (qError) return { error: qError.message }

    // 2. Reset Opsi (Hapus Lama, Insert Baru - Cara paling aman untuk perubahan struktur opsi)
    await supabase.from('options').delete().eq('question_id', questionId)
    await handleSaveOptions(supabase, questionId, questionType, formData)

    revalidatePath(`/dashboard/teacher/quiz/${quizId}`)
    return { success: true }
}

// --- 3. REORDER (BARU: GESER URUTAN) ---
export async function reorderQuestionAction(questionId: string, quizId: string, direction: 'up' | 'down') {
    const supabase = await createClient()

    // Ambil soal saat ini
    const { data: currentQ } = await supabase.from('questions').select('created_at').eq('id', questionId).single()
    if(!currentQ) return

    // Cari tetangga (neighbor) berdasarkan waktu dibuat (created_at) karena kita order by created_at
    // NOTE: Logic terbaik adalah pakai kolom 'order', tapi karena kita belum setup kolom order di questions,
    // kita swap 'created_at' nya saja (hack cepat & efektif).
    
    const operator = direction === 'up' ? 'lt' : 'gt' // lt = less than (sebelum), gt = greater than (sesudah)
    const order = direction === 'up' ? { ascending: false } : { ascending: true }

    const { data: neighbor } = await supabase
        .from('questions')
        .select('id, created_at')
        .eq('quiz_id', quizId)
        [operator]('created_at', currentQ.created_at) // Filter tetangga
        .order('created_at', order)
        .limit(1)
        .single()

    if (neighbor) {
        // Swap timestamp created_at
        await supabase.from('questions').update({ created_at: neighbor.created_at }).eq('id', questionId)
        await supabase.from('questions').update({ created_at: currentQ.created_at }).eq('id', neighbor.id)
    }

    revalidatePath(`/dashboard/teacher/quiz/${quizId}`)
}

// --- 4. DELETE (SAMA) ---
export async function deleteQuestionAction(questionId: string, quizId: string) {
    const supabase = await createClient()
    await supabase.from('questions').delete().eq('id', questionId)
    revalidatePath(`/dashboard/teacher/quiz/${quizId}`)
}

// --- HELPER: SIMPAN OPSI ---
async function handleSaveOptions(supabase: any, questionId: string, type: string, formData: FormData) {
    let optionsData = []
    if (type === 'short_answer') {
        const answerKey = formData.get('answerKey') as string
        optionsData.push({ question_id: questionId, option_text: answerKey, is_correct: true })
    } else {
        const correctIndex = parseInt(formData.get('correctIndex') as string)
        let i = 0
        while (formData.has(`option_${i}`)) {
            const text = formData.get(`option_${i}`) as string
            optionsData.push({ question_id: questionId, option_text: text, is_correct: i === correctIndex })
            i++
        }
    }
    await supabase.from('options').insert(optionsData)
}