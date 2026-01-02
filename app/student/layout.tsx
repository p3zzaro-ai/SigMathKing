import { StudentSidebar } from "@/components/dashboard/StudentSidebar"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-green-50/30">
      {/* Sidebar Kiri (Fixed) */}
      <aside className="fixed inset-y-0 left-0 z-10 w-64 hidden md:block">
        <StudentSidebar />
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