'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle2, CircleDashed } from 'lucide-react'

type StudentCard = {
  id: string
  full_name: string
  status: 'idle' | 'submitted'
  score: number | null
}

export default function RealtimeBoard({ assignmentId }: { assignmentId: string }) {
  const supabase = createClient()
  const [students, setStudents] = useState<StudentCard[]>([])
  
  // 1. Fetch Data Awal
  useEffect(() => {
    const fetchData = async () => {
      // Ambil semua siswa (role student)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student')

      // Ambil submission untuk kuis ini
      const { data: submissions } = await supabase
        .from('submissions')
        .select('user_id, score')
        .eq('assignment_id', assignmentId)

      if (profiles) {
        // Gabungkan data: Default status 'idle', kalau ada di submission jadi 'submitted'
        const mergedData: StudentCard[] = profiles.map(student => {
          const sub = submissions?.find(s => s.user_id === student.id)
          return {
            id: student.id,
            full_name: student.full_name || 'Siswa Tanpa Nama',
            status: sub ? 'submitted' : 'idle',
            score: sub ? sub.score : null
          }
        })
        setStudents(mergedData)
      }
    }

    fetchData()

    // 2. SETUP REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('live-submissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Dengarkan data baru
          schema: 'public',
          table: 'submissions',
          filter: `assignment_id=eq.${assignmentId}`
        },
        (payload) => {
          // Saat ada data baru masuk:
          const newSub = payload.new as any
          
          setStudents(prevStudents => prevStudents.map(student => {
            if (student.id === newSub.user_id) {
              return { ...student, status: 'submitted', score: newSub.score }
            }
            return student
          }))
          
          // Efek suara notifikasi (Opsional)
          new Audio('/notification.mp3').play().catch(() => {}) 
        }
      )
      .subscribe()

    // Cleanup saat keluar halaman
    return () => {
      supabase.removeChannel(channel)
    }
  }, [assignmentId, supabase])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {students.map((student) => (
        <Card 
          key={student.id} 
          className={`transition-all duration-500 transform ${
            student.status === 'submitted' 
              ? 'bg-green-100 border-green-400 scale-105 shadow-lg' 
              : 'bg-slate-50 border-dashed opacity-80'
          }`}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40 gap-3">
            <Avatar className={student.status === 'submitted' ? 'bg-green-200' : 'bg-slate-200'}>
              <AvatarFallback className="text-xs">
                {student.full_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <p className="font-bold text-sm truncate w-full px-2">{student.full_name}</p>
              
              {student.status === 'submitted' ? (
                <div className="mt-2 animate-in fade-in zoom-in">
                  <span className="text-2xl font-black text-green-700">{student.score}</span>
                  <div className="flex items-center justify-center gap-1 text-xs text-green-600 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Selesai
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400">
                  <CircleDashed className="w-3 h-3 animate-spin-slow" /> Mengerjakan...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}