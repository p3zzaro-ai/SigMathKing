import { createClient } from '@/utils/supabase/server'
import RealtimeBoard from '@/components/dashboard/RealtimeBoard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function MonitorRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: assignment } = await supabase
    .from('assignments')
    .select('title')
    .eq('id', id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/monitor">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Monitor: {assignment?.title}</h1>
          <p className="text-xs text-slate-500">Kartu akan berubah warna otomatis saat siswa mengumpulkan.</p>
        </div>
      </div>
      
      <RealtimeBoard assignmentId={id} />
    </div>
  )
}