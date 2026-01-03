// app/preview/item/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import MarkdownViewer from '@/components/markdown-viewer'

// Helper untuk embed youtube sederhana
function getYoutubeEmbedUrl(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PreviewItemPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('module_items')
    .select('*')
    .eq('id', id)
    .single()

  if (!item) return notFound()

  // Support legacy content (yang masih format text) dan new content (json)
  const contentBody = item.content?.body || item.content?.text || ''
  const videoUrl = item.content?.video || ''
  const embedUrl = getYoutubeEmbedUrl(videoUrl)

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-6 text-white">
          <div className="flex justify-between items-start">
             <h1 className="text-2xl font-bold">{item.title}</h1>
             <span className="text-xs font-mono bg-indigo-500 px-2 py-1 rounded text-indigo-100 uppercase">
                {item.is_published ? 'Published' : 'Draft Mode'}
             </span>
          </div>
        </div>

        <div className="p-8">
            {/* 1. VIDEO SECTION (Fixed at Top) */}
            {embedUrl && (
                <div className="mb-8 aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-200">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={embedUrl} 
                        title="Video Pembelajaran"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            {/* 2. MARKDOWN CONTENT */}
            <MarkdownViewer content={contentBody} />
        </div>

      </div>
    </div>
  )
}