// app/actions/auth.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect akan ditangani oleh Middleware, tapi kita bisa return success
  return { success: true }
}

export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const fullName = formData.get('fullName') as string
  const nis = formData.get('nis') as string
  const gender = formData.get('gender') as string
  const role = formData.get('role') as string 
  const teacherCode = formData.get('teacherCode') as string // Ambil input kode

  // --- LOGIKA KEAMANAN ---
  // Jika user memilih role 'teacher', Cek kodenya
  if (role === 'teacher') {
    if (teacherCode !== process.env.TEACHER_SECRET_CODE) {
      return { error: 'Kode Akses Guru salah! Anda tidak berhak mendaftar sebagai Guru.' }
    }
  }
  // -----------------------

  // Update Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      full_name: fullName,
      nis: nis,
      gender: gender,
      role: role,
      is_onboarded: true
    })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  // Update Metadata
  await supabase.auth.updateUser({
    data: { is_onboarded: true, role: role }
  })
  
  const target = role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'
  redirect(target)
}