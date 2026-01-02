import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Star, Target } from "lucide-react"

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil Stats
  // Total Submissions
  const { count: subCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  // Rata-rata Nilai (Manual calculation karena supabase simple query)
  const { data: subs } = await supabase
    .from('submissions')
    .select('score')
    .eq('user_id', user?.id)
  
  const totalScore = subs?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0
  const avgScore = subs?.length ? Math.round(totalScore / subs.length) : 0

  // 2. Ambil Badges Milik User
  const { data: myBadges } = await supabase
    .from('user_badges')
    .select('*, badges(*)') // Join ke tabel badges
    .eq('user_id', user?.id)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Halo, Sang Juara! 👋</h1>
      
      {/* Kartu Statistik */}
      <div className="grid gap-4 md:grid-cols-3">
        
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Total XP (Rata-rata)</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{avgScore} XP</div>
            <p className="text-xs text-yellow-600">Terus tingkatkan nilaimu!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Selesai</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subCount}</div>
            <p className="text-xs text-muted-foreground">Misi terselesaikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Koleksi Badge</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myBadges?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Piala didapatkan</p>
          </CardContent>
        </Card>

      </div>
      
      {/* Area Badge Gallery */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Lemari Piala Saya</h2>
        
        {myBadges && myBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myBadges.map((item: any) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
                <div className="text-4xl">{item.badges.icon}</div>
                <div>
                  <h3 className="font-bold text-sm">{item.badges.name}</h3>
                  <p className="text-xs text-slate-500">{item.badges.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed rounded-lg text-center text-slate-500 bg-slate-50">
            <Trophy className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p>Belum ada badge. Kerjakan kuis dengan nilai 100 untuk dapat piala!</p>
          </div>
        )}
      </div>
    </div>
  )
}