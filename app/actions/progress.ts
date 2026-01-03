// app/actions/progress.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleProgressAction(itemId: string, classId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Status baru adalah kebalikan dari status lama
  const newStatus = !currentStatus

  if (newStatus) {
    // Jika ditandai SELESAI -> Upsert (Insert atau Update jika ada)
    const { error } = await supabase
      .from('student_progress')
      .upsert({
        student_id: user.id,
        item_id: itemId,
        is_completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'student_id, item_id' })
      
    if (error) return { error: error.message }
  } else {
    // Jika batal selesai (uncheck) -> Update jadi false
    const { error } = await supabase
        .from('student_progress')
        .update({ is_completed: false })
        .eq('student_id', user.id)
        .eq('item_id', itemId)

    if (error) return { error: error.message }
  }

  // Refresh halaman agar UI terupdate
  revalidatePath(`/dashboard/student/class/${classId}`)
  revalidatePath(`/dashboard/student/class/${classId}/learn/${itemId}`)
  return { success: true }
}