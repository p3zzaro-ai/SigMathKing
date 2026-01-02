'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAssignment(data: any) {
  const supabase = await createClient()

  const { title, type, video_url, questions } = data

  const { error } = await supabase
    .from('assignments')
    .insert({
      title,
      type, // 'quiz' atau 'material'
      video_url, // Link YouTube hasil Manim
      content: questions, // Array JSON soal
    })

  if (error) {
    console.error('Error creating assignment:', error)
    return { error: 'Gagal menyimpan data.' }
  }

  revalidatePath('/teacher/assignments')
  return { success: true }
}