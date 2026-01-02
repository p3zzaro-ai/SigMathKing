import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Video, FileQuestion } from 'lucide-react'

export default async function AssignmentListPage() {
  const supabase = await createClient()

  // Ambil data assignments dari database
  const { data: assignments } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bank Soal & Materi</h1>
        <Link href="/teacher/assignments/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Buat Baru
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments?.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {item.type === 'quiz' ? 'Kuis Interaktif' : 'Materi'}
              </CardTitle>
              {item.video_url ? <Video className="h-4 w-4 text-blue-500" /> : <FileQuestion className="h-4 w-4" />}
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold mb-2">{item.title}</div>
              <p className="text-xs text-muted-foreground">
                Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}
              </p>
              <div className="mt-4 flex gap-2">
                 <Button variant="outline" size="sm" className="w-full">Edit (Soon)</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {assignments?.length === 0 && (
          <div className="col-span-full p-10 text-center border border-dashed rounded-lg bg-slate-50 text-slate-500">
            Belum ada materi. Klik tombol "Buat Baru" di atas.
          </div>
        )}
      </div>
    </div>
  )
}