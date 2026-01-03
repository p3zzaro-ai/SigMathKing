// app/actions/item.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItemAction(formData: FormData) {
  const supabase = await createClient()
  
  const moduleId = formData.get('moduleId') as string
  const classroomId = formData.get('classroomId') as string
  const title = formData.get('title') as string
  const videoUrl = formData.get('videoUrl') as string
  const markdownBody = formData.get('markdownBody') as string
  
  // Default: TERKUNCI (is_locked = true) saat dibuat
  const isLocked = true 

  const contentJson = {
    video: videoUrl,
    body: markdownBody
  }

  // Hitung urutan
  const { count } = await supabase
    .from('module_items')
    .select('*', { count: 'exact', head: true })
    .eq('module_id', moduleId)

  const newOrder = (count || 0) + 1

  const { error } = await supabase.from('module_items').insert({
    module_id: moduleId,
    title: title,
    type: 'text', 
    content: contentJson,
    order: newOrder,
    is_locked: isLocked, // Pakai kolom baru
    is_published: true // Legacy: set true terus agar muncul
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/teacher/class/${classroomId}`)
  return { success: true }
}

export async function updateItemAction(formData: FormData) {
  const supabase = await createClient()
  
  const itemId = formData.get('itemId') as string
  const classroomId = formData.get('classroomId') as string
  const title = formData.get('title') as string
  const videoUrl = formData.get('videoUrl') as string
  const markdownBody = formData.get('markdownBody') as string

  const contentJson = {
    video: videoUrl,
    body: markdownBody
  }

  const { error } = await supabase
    .from('module_items')
    .update({
      title: title,
      content: contentJson,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/teacher/class/${classroomId}`)
  return { success: true }
}

// --- ACTION BARU: TOGGLE LOCK (SAKLAR GEMBOK) ---
export async function toggleLockAction(itemId: string, currentStatus: boolean, classroomId: string) {
    const supabase = await createClient()
    
    // Balik statusnya (True jadi False, False jadi True)
    const newStatus = !currentStatus

    await supabase
        .from('module_items')
        .update({ is_locked: newStatus })
        .eq('id', itemId)

    revalidatePath(`/dashboard/teacher/class/${classroomId}`)
}

export async function deleteItemAction(itemId: string, classroomId: string) {
  const supabase = await createClient()
  await supabase.from('module_items').delete().eq('id', itemId)
  revalidatePath(`/dashboard/teacher/class/${classroomId}`)
}

export async function reorderItemAction(itemId: string, moduleId: string, classroomId: string, direction: 'up' | 'down') {
    const supabase = await createClient()

    const { data: currentItem } = await supabase.from('module_items').select('id, order').eq('id', itemId).single()
    if(!currentItem) return

    const operator = direction === 'up' ? 'lt' : 'gt'
    const orderSort = direction === 'up' ? { ascending: false } : { ascending: true }

    const { data: neighbor } = await supabase
        .from('module_items')
        .select('id, order')
        .eq('module_id', moduleId)
        [operator]('order', currentItem.order)
        .order('order', orderSort)
        .limit(1)
        .single()

    if (neighbor) {
        await supabase.from('module_items').update({ order: neighbor.order }).eq('id', itemId)
        await supabase.from('module_items').update({ order: currentItem.order }).eq('id', neighbor.id)
        revalidatePath(`/dashboard/teacher/class/${classroomId}`)
    }
}