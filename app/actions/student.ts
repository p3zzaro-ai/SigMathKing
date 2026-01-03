// app/actions/student.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinClassroomAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const code = formData.get('code') as string
  
  // 1. Cari kelas berdasarkan Kode
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id')
    .eq('code', code.toUpperCase()) // Pastikan huruf besar
    .single()

  if (!classroom) {
    return { error: 'Kode kelas tidak ditemukan!' }
  }

  // 2. Cek apakah sudah bergabung?
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('classroom_id', classroom.id)
    .eq('student_id', user.id)
    .single()

  if (existing) {
    return { error: 'Anda sudah bergabung di kelas ini!' }
  }

  // 3. Masukkan ke tabel enrollments
  const { error } = await supabase
    .from('enrollments')
    .insert({
      classroom_id: classroom.id,
      student_id: user.id,
      joined_at: new Date().toISOString()
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/student')
  return { success: true }
}