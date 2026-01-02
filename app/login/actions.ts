'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // 1. Ambil data dari form
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  // 2. Coba Login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 3. Jika Login Gagal, coba Sign Up
  if (signInError) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    })

    if (signUpError) {
      // PERBAIKAN DI SINI:
      // Jangan return object, tapi redirect dengan pesan error
      return redirect('/login?message=Gagal login. Pastikan email benar atau coba daftar.')
    }
  }

  // 4. Cek Role User untuk Redirect
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'student'

    revalidatePath('/', 'layout')
    
    if (role === 'teacher') {
      redirect('/teacher/dashboard')
    } else {
      redirect('/student/dashboard')
    }
  }

  // Fallback jika aneh
  return redirect('/login?message=Terjadi kesalahan tak terduga')
}