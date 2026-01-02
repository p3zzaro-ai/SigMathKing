import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Activity } from "lucide-react"

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Guru</h1>
      
      {/* Kartu Statistik */}
      <div className="grid gap-4 md:grid-cols-3">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Kelas 10 IPA 1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuis Aktif</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Trigonometri & Fungsi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Kelas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5</div>
            <p className="text-xs text-muted-foreground">+2.5% dari minggu lalu</p>
          </CardContent>
        </Card>

      </div>
      
      {/* Area Kosong untuk Konten Lain */}
      <div className="rounded-lg border bg-white p-8 text-center text-slate-500 border-dashed h-64 flex items-center justify-center">
        Grafik Perkembangan Siswa akan muncul di sini (Day 2)
      </div>
    </div>
  )
}