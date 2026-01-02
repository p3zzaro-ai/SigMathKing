import Link from "next/link"
import { LayoutDashboard, PlayCircle, Trophy, LogOut, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/login/signout"

export function StudentSidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b px-6">
        <GraduationCap className="mr-2 h-6 w-6 text-green-600" />
        <span className="text-lg font-bold text-slate-800">Student Area</span>
      </div>

      {/* Menu Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          
          <Link href="/student/dashboard">
            <span className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-600">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Progress Saya
            </span>
          </Link>

          <Link href="/student/assignments">
            <span className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-600">
              <PlayCircle className="mr-3 h-5 w-5" />
              Materi & Kuis
            </span>
          </Link>

          <Link href="/student/achievements">
            <span className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-600">
              <Trophy className="mr-3 h-5 w-5" />
              Pencapaian
            </span>
          </Link>

        </nav>
      </div>

      {/* Logout Button Area */}
      <div className="border-t p-4">
        <form action={signOut}>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </form>
      </div>
    </div>
  )
}