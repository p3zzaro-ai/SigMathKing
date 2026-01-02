import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export default async function MonitorSelectPage() {
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*')
    .eq('type', 'quiz') // Hanya kuis yang butuh monitor
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Live Monitoring Kelas</h1>
      <p className="text-slate-500">Pilih kuis untuk melihat aktivitas siswa secara realtime.</p>

      <div className="grid gap-4 md:grid-cols-3">
        {assignments?.map((item) => (
          <Card key={item.id} className="hover:border-blue-400 cursor-pointer transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/teacher/monitor/${item.id}`}>
                <Button className="w-full" variant="outline">
                  <Eye className="mr-2 h-4 w-4" /> Buka Live View
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}