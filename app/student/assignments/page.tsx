import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayCircle, CheckCircle, Clock } from 'lucide-react'

export default async function StudentAssignmentList() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil semua tugas
  const { data: assignments } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false })

  // 2. Ambil tugas yang sudah dikerjakan siswa ini
  const { data: submissions } = await supabase
    .from('submissions')
    .select('assignment_id, score')
    .eq('user_id', user?.id)

  // Helper: Cek status tugas
  const getStatus = (assignmentId: string) => {
    const sub = submissions?.find(s => s.assignment_id === assignmentId)
    if (sub) return { status: 'done', score: sub.score }
    return { status: 'pending', score: null }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Materi & Kuis Saya</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments?.map((item) => {
          const { status, score } = getStatus(item.id)
          
          return (
            <Card key={item.id} className={`hover:shadow-md transition-shadow ${status === 'done' ? 'bg-green-50/50 border-green-200' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {item.type === 'quiz' ? 'Kuis' : 'Materi'}
                </CardTitle>
                {status === 'done' 
                  ? <CheckCircle className="h-5 w-5 text-green-600" />
                  : <Clock className="h-5 w-5 text-yellow-600" />
                }
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold mb-2">{item.title}</div>
                
                {status === 'done' ? (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-green-700">Sudah Dikerjakan</p>
                    <p className="text-2xl font-bold text-green-800">Nilai: {score}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                     <Link href={`/student/assignments/${item.id}`}>
                      <Button className="w-full">Kerjakan Sekarang</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}