// app/actions/course.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createModuleAction(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const classroomId = formData.get('classroomId') as string

  // Cari urutan terakhir
  const { count } = await supabase
    .from('modules')
    .select('*', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)

  const newOrder = (count || 0) + 1

  const { error } = await supabase.from('modules').insert({
    classroom_id: classroomId,
    title: title,
    order: newOrder
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/teacher/class/${classroomId}`)
  return { success: true }
}

export async function reorderModulesAction(items: { id: string; order: number }[], classroomId: string) {
  const supabase = await createClient()

  // Update batch (Kita loop update sederhana untuk MVP)
  // Untuk production scale besar bisa pakai RPC, tapi ini cukup untuk LMS sekolah
  for (const item of items) {
    await supabase.from('modules').update({ order: item.order }).eq('id', item.id)
  }

  revalidatePath(`/dashboard/teacher/class/${classroomId}`)
}

export async function deleteModuleAction(moduleId: string, classroomId: string) {
    const supabase = await createClient()
    await supabase.from('modules').delete().eq('id', moduleId)
    revalidatePath(`/dashboard/teacher/class/${classroomId}`)
}