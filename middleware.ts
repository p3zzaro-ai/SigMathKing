import { type NextRequest } from 'next/server'
// PERBAIKAN DI SINI: Import dari update-session, bukan middleware
import { updateSession } from '@/utils/supabase/update-session'

export async function middleware(request: NextRequest) {
  // Panggil fungsi yang baru kita update tadi
  const { supabase, response } = await updateSession(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Proteksi Route: Jika user belum login, lempar ke /login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return Response.redirect(new URL('/login', request.url))
  }

  // 2. Logika Onboarding
  if (user) {
    const isOnboarded = user.user_metadata?.is_onboarded
    const isTeacher = user.user_metadata?.role === 'teacher'
    
    // Jika belum onboard dan bukan di halaman onboarding, paksa ke onboarding
    if (!isOnboarded && !request.nextUrl.pathname.startsWith('/onboarding')) {
      return Response.redirect(new URL('/onboarding', request.url))
    }

    // Jika SUDAH onboard tapi mencoba akses halaman login atau onboarding, lempar ke dashboard
    if (isOnboarded && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/onboarding'))) {
       const target = isTeacher ? '/dashboard/teacher' : '/dashboard/student'
       return Response.redirect(new URL(target, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}