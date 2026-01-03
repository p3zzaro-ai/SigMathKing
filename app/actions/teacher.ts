// app/actions/teacher.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function generateClassCode() {
  return 'MATH-' + Math.random().toString(36).substring(2, 6).toUpperCase()
}

export async function createClassroomAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const level = formData.get('level') as string // <--- Tangkap Level
  const code = generateClassCode()

  const { error } = await supabase
    .from('classrooms')
    .insert({
      teacher_id: user.id,
      name: name,
      description: description,
      level: level, // <--- Simpan Level
      code: code
    })

  if (error) return { error: error.message }

  // Revalidate halaman level yang bersangkutan
  revalidatePath(`/dashboard/teacher/level/${level}`)
  return { success: true }
}

// --- ACTION BARU: HAPUS KELAS ---
export async function deleteClassroomAction(classId: string, level: string) {
    const supabase = await createClient()
    
    // Hapus kelas (Cascade akan menghapus bab, materi, enrollments otomatis jika DB diset benar)
    const { error } = await supabase.from('classrooms').delete().eq('id', classId)
    
    if (error) return { error: error.message }
    
    revalidatePath(`/dashboard/teacher/level/${level}`)
}

// --- ACTION BARU: UPDATE KELAS ---
export async function updateClassroomAction(formData: FormData) {
  const supabase = await createClient()
  
  const classId = formData.get('classId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const level = formData.get('level') as string // untuk revalidate path

  const { error } = await supabase
    .from('classrooms')
    .update({
      name: name,
      description: description
    })
    .eq('id', classId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/teacher/materials/level/${level}`)
  return { success: true }
}