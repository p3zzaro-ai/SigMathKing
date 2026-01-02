import { type NextRequest } from 'next/server'
// Perhatikan kita import dari file yang baru kita rename
import { updateSession } from '@/utils/supabase/update-session'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}