// components/dashboard/Sidebar.tsx
'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Activity, 
  Calculator, 
  Coffee,
  LogOut,
  GraduationCap,
  FileQuestion,
  Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"

// MENU GURU
const teacherRoutes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/teacher", color: "text-sky-500" },
  { label: "Materi Pembelajaran", icon: BookOpen, href: "/dashboard/teacher/materials", color: "text-violet-500" },
  { label: "Manajemen Kelas", icon: Users, href: "/dashboard/teacher/students", color: "text-pink-700" },
  { label: "Live Report", icon: Activity, href: "/dashboard/teacher/livereport", color: "text-orange-700" },
  { label: "Olah Nilai", icon: Calculator, href: "/dashboard/teacher/grades", color: "text-emerald-500" },
  { label: "Ice Breaking", icon: Coffee, href: "/dashboard/teacher/icebreaking", color: "text-yellow-500" },
]

// MENU SISWA (Persiapan Fase 3)
const studentRoutes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/student", color: "text-sky-500" },
  { label: "Tugas Saya", icon: FileQuestion, href: "/dashboard/student/assignments", color: "text-violet-500" },
  { label: "Peringkat", icon: Trophy, href: "/dashboard/student/leaderboard", color: "text-yellow-500" },
]

export default function Sidebar() {
  const pathname = usePathname()
  
  // Deteksi: Apakah ini halaman Guru atau Siswa?
  const isTeacherPage = pathname?.includes("/dashboard/teacher")
  
  // Pilih menu yang sesuai
  const routes = isTeacherPage ? teacherRoutes : studentRoutes
  const appTitle = isTeacherPage ? "Teacher Panel" : "Student Area"

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white border-r border-gray-800">
      <div className="px-3 py-2 flex-1">
        <Link href={isTeacherPage ? "/dashboard/teacher" : "/dashboard/student"} className="flex items-center pl-3 mb-10 transition hover:opacity-75">
          <div className="relative h-8 w-8 mr-4">
             <GraduationCap className="h-8 w-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
                SigMath<span className="text-indigo-500">King</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                {appTitle}
            </p>
          </div>
        </Link>
        
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href || (route.href !== "/dashboard/teacher" && route.href !== "/dashboard/student" && pathname.startsWith(route.href))
                    ? "text-white bg-white/10" 
                    : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Footer Sidebar */}
      <div className="px-3 py-2 border-t border-gray-800">
         <form action="/auth/signout" method="post">
             <button className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-red-500/10 rounded-lg transition text-zinc-400 hover:text-red-500">
                <div className="flex items-center flex-1">
                    <LogOut className="h-5 w-5 mr-3" />
                    Keluar Aplikasi
                </div>
             </button>
         </form>
      </div>
    </div>
  )
}