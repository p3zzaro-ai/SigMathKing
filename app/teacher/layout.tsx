import { TeacherSidebar } from "@/components/dashboard/Sidebar"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Kiri (Fixed) */}
      <aside className="fixed inset-y-0 left-0 z-10 w-64 hidden md:block">
        <TeacherSidebar />
      </aside>

      {/* Konten Utama (Sebelah Kanan) */}
      <main className="flex-1 md:pl-64">
        <div className="h-full p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}