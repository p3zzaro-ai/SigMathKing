// app/dashboard/teacher/page.tsx
import { createClient } from '@/utils/supabase/server'
import { Users, BookOpen, TrendingUp } from 'lucide-react'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  
  // Dummy Stats (Nanti bisa diganti real count)
  const stats = [
    { title: "Total Siswa", value: "128", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Materi Selesai", value: "1,240", icon: BookOpen, color: "text-green-600", bg: "bg-green-100" },
    { title: "Rata-rata Kuis", value: "84.5", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Guru</h1>
        <p className="text-slate-500 mb-6">Ringkasan statistik pembelajaran matematika.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      {/* Area kosong untuk widget masa depan */}
      <div className="h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
        <div className="text-center">
            <TrendingUp className="mx-auto h-10 w-10 mb-2 opacity-50" />
            Grafik Perkembangan Siswa (Coming Soon)
        </div>
      </div>
    </div>
  )
}