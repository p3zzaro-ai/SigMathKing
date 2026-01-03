// app/actions/quiz.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createQuizAction(formData: FormData) {
  const supabase = await createClient()

  const moduleId = formData.get('moduleId') as string
  const classroomId = formData.get('classroomId') as string
  const title = formData.get('title') as string
  const duration = parseInt(formData.get('duration') as string) || 30 // Default 30 menit

  // 1. Buat Data Kuis di tabel 'quizzes'
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      module_id: moduleId,
      title: title,
      duration: duration,
      passing_score: 70 // Default KKM
    })
    .select()
    .single()

  if (quizError) return { error: quizError.message }

  // 2. Buat Item di 'module_items' agar muncul di list
  // Kita cari urutan terakhir dulu
  const { count } = await supabase
    .from('module_items')
    .select('*', { count: 'exact', head: true })
    .eq('module_id', moduleId)

  const newOrder = (count || 0) + 1

  const { error: itemError } = await supabase
    .from('module_items')
    .insert({
      module_id: moduleId,
      title: title, // Judul item sama dengan judul kuis
      type: 'quiz', // TIPE PENTING!
      content: { quiz_id: quiz.id }, // Link ke tabel quizzes
      order: newOrder,
      is_locked: true,
      is_published: true
    })

  if (itemError) return { error: itemError.message }

  revalidatePath(`/dashboard/teacher/class/${classroomId}`)
  return { success: true }
}

export async function deleteQuizAction(itemId: string, quizId: string, classroomId: string) {
    const supabase = await createClient()
    
    // Hapus item (Cascade akan menghapus kuis jika settingan DB benar, 
    // tapi untuk aman kita hapus manual dua-duanya atau andalkan relation)
    
    // Karena kita set ON DELETE CASCADE di SQL tadi, 
    // cukup hapus module_items, atau hapus quizzes.
    // Tapi karena logic kita item adalah parent visualnya, kita hapus item.
    
    // Namun, relasi quizzes -> modules. Bukan quizzes -> module_items.
    // Jadi hapus item TIDAK otomatis menghapus kuis di tabel quizzes.
    // Kita harus hapus dua-duanya.
    
    await supabase.from('module_items').delete().eq('id', itemId)
    await supabase.from('quizzes').delete().eq('id', quizId)

    revalidatePath(`/dashboard/teacher/class/${classroomId}`)
}

// --- ACTION BARU: UPDATE SETTING KUIS ---
export async function updateQuizAction(formData: FormData) {
  const supabase = await createClient()

  const quizId = formData.get('quizId') as string
  const duration = parseInt(formData.get('duration') as string)
  const passingScore = parseInt(formData.get('passingScore') as string)
  // Kita butuh classroomId untuk revalidate, tapi jika repot ambil dari client, 
  // kita bisa return success dan client side router.refresh()
  
  const { error } = await supabase
    .from('quizzes')
    .update({
      duration: duration,
      passing_score: passingScore,
      updated_at: new Date().toISOString()
    })
    .eq('id', quizId)

  if (error) return { error: error.message }
  
  return { success: true }
}