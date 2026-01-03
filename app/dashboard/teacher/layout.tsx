// app/dashboard/layout.tsx
import Sidebar from "@/components/dashboard/Sidebar" // <--- Pastikan import dari components/dashboard

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative">
      {/* Sidebar Desktop */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      
      {/* Konten Utama */}
      <main className="md:pl-72 pb-10">
        {/* Navbar Mobile (Opsional/Placeholder jika nanti butuh) */}
        {/* <div className="md:hidden flex items-center p-4 border-b">...Mobile Trigger...</div> */}
        
        <div className="p-8">
           {children}
        </div>
      </main>
    </div>
  )
}