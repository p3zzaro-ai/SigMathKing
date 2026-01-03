// app/dashboard/teacher/quiz/[quizId]/quiz-settings.tsx
'use client'

import { useState } from 'react'
import { updateQuizAction } from '@/app/actions/quiz'
import { Settings, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function QuizSettings({ quiz }: { quiz: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (formData: FormData) => {
    setLoading(true)
    await updateQuizAction(formData)
    setLoading(false)
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        title="Pengaturan Kuis"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95">
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
              
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Settings size={18} /> Pengaturan Kuis
              </h3>

              <form action={handleUpdate} className="space-y-4">
                  <input type="hidden" name="quizId" value={quiz.id} />
                  
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Durasi (Menit)</label>
                      <input name="duration" type="number" defaultValue={quiz.duration} className="w-full border p-2 rounded-md" />
                  </div>

                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">KKM (Passing Score)</label>
                      <input name="passingScore" type="number" defaultValue={quiz.passing_score} className="w-full border p-2 rounded-md" />
                  </div>

                  <button disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-md font-bold text-sm">
                      {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
              </form>
           </div>
        </div>
      )}
    </>
  )
}