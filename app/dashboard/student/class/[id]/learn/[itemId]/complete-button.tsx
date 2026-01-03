// app/dashboard/student/class/[id]/learn/[itemId]/complete-button.tsx
'use client'

import { useState } from 'react'
import { toggleProgressAction } from '@/app/actions/progress'
import { CheckCircle, Circle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CompleteButton({ 
    itemId, 
    classId, 
    isCompleted 
}: { 
    itemId: string, 
    classId: string, 
    isCompleted: boolean 
}) {
  const [completed, setCompleted] = useState(isCompleted)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    
    // Optimistic UI: Langsung ubah tampilan biar terasa cepat
    const newStatus = !completed
    setCompleted(newStatus)

    // Kirim ke server
    await toggleProgressAction(itemId, classId, completed)
    
    setLoading(false)
    router.refresh() // Pastikan data sinkron
  }

  return (
    <button 
        onClick={handleToggle}
        disabled={loading}
        className={`
            px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95
            ${completed 
                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
            }
        `}
    >
        {completed ? (
            <>
                <CheckCircle size={20} /> Sudah Selesai
            </>
        ) : (
            <>
                <Circle size={20} /> Tandai Selesai
            </>
        )}
    </button>
  )
}