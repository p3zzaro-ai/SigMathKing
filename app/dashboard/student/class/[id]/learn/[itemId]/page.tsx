// app/dashboard/student/class/[id]/learn/[itemId]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MarkdownViewer from '@/components/markdown-viewer'
// Import Tombol Baru
import CompleteButton from './complete-button' 

function getYoutubeEmbedUrl(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

interface PageProps {
  params: Promise<{ id: string, itemId: string }>
}

export default async function LearningPage({ params }: PageProps) {
  const { id: classId, itemId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil Data Materi
  const { data: item } = await supabase.from('module_items').select('*').eq('id', itemId).single()
  if (!item) return notFound()
  if (item.is_locked) redirect(`/dashboard/student/class/${classId}`)

  // 2. CEK STATUS PROGRES SISWA (NEW)
  const { data: progress } = await supabase
    .from('student_progress')
    .select('is_completed')
    .eq('student_id', user?.id)
    .eq('item_id', itemId)
    .single()
  
  const isCompleted = progress?.is_completed || false

  const contentBody = item.content?.body || item.content?.text || ''
  const videoUrl = item.content?.video || ''
  const embedUrl = getYoutubeEmbedUrl(videoUrl)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/student/class/${classId}`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">
            <ArrowLeft size={18} /> Kembali ke Materi
        </Link>
        <div className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md">
            {item.title}
        </div>
      </div>

      {embedUrl ? (
          <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5">
            <iframe width="100%" height="100%" src={embedUrl} title={item.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
      ) : (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center text-indigo-800">
             <p className="font-bold">Materi ini tidak memiliki video.</p>
             <p className="text-sm opacity-75">Silakan baca rangkuman materi di bawah ini.</p>
          </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Rangkuman Materi</h2>
        <MarkdownViewer content={contentBody} />
      </div>

      {/* 3. PASANG TOMBOL INTERAKTIF (NEW) */}
      <div className="flex justify-end sticky bottom-6 z-10">
         <CompleteButton 
            itemId={itemId} 
            classId={classId} 
            isCompleted={isCompleted} 
         />
      </div>

    </div>
  )
}