// app/dashboard/teacher/class/[id]/module-item-manager.tsx
'use client'

import { reorderItemAction } from '@/app/actions/item'
import { ArrowUp, ArrowDown } from 'lucide-react' // Import icon panah
import { useState } from 'react'
import { createItemAction, deleteItemAction, updateItemAction, toggleLockAction } from '@/app/actions/item'
import { createQuizAction, deleteQuizAction } from '@/app/actions/quiz' // [BARU] Import Action Kuis
import { FileText, Trash2, Plus, X, Pencil, ExternalLink, Save, Youtube, Lock, Unlock, BrainCircuit } from 'lucide-react' // [BARU] Icon BrainCircuit
import MarkdownViewer from '@/components/markdown-viewer'
import Link from 'next/link'

export default function ModuleItemManager({ 
  moduleId, 
  classroomId,
  items 
}: { 
  moduleId: string, 
  classroomId: string,
  items: any[] 
}) {
  // [UPDATE] State editingId sekarang bisa 'new-materi' atau 'new-quiz'
  const [editingId, setEditingId] = useState<string | 'new-materi' | 'new-quiz' | null>(null)
  const [loadingLock, setLoadingLock] = useState<string | null>(null)

  const handleClose = () => setEditingId(null)

  const handleDelete = async (item: any) => {
    if(!confirm('Hapus item ini selamanya?')) return

    // [LOGIKA BARU] Cek tipe item saat menghapus
    if (item.type === 'quiz') {
        const quizId = item.content?.quiz_id
        await deleteQuizAction(item.id, quizId, classroomId)
    } else {
        await deleteItemAction(item.id, classroomId)
    }
  }

  const handleToggleLock = async (itemId: string, isLocked: boolean) => {
      setLoadingLock(itemId)
      await toggleLockAction(itemId, isLocked, classroomId)
      setLoadingLock(null)
  }

  const handleReorder = async (itemId: string, direction: 'up' | 'down') => {
    // Bisa tambah loading state jika mau
    await reorderItemAction(itemId, moduleId, classroomId, direction)
}

  return (
    <div className="mt-4 pl-4 border-l-2 border-slate-100 space-y-3">
      {/* LIST ITEMS */}
      {items.map((item) => {
        const isLocked = item.is_locked !== false 
        // [BARU] Cek apakah ini kuis
        const isQuiz = item.type === 'quiz'

        // MODE EDIT (Hanya untuk Materi Teks/Video, Kuis diedit di halaman terpisah)
        if (editingId === item.id && !isQuiz) {
            return (
                <div key={item.id} className="bg-white border border-indigo-500 ring-1 ring-indigo-500 p-4 rounded-lg shadow-lg relative animate-in zoom-in-95 duration-200">
                    <ItemForm 
                        key={item.id}
                        mode="edit"
                        itemId={item.id}
                        initialTitle={item.title}
                        initialVideo={item.content?.video || ''}
                        initialBody={item.content?.body || item.content?.text || ''}
                        moduleId={moduleId}
                        classroomId={classroomId}
                        onClose={handleClose}
                    />
                </div>
            )
        }

        // MODE LIST KARTU
        return (
          <div 
            key={item.id} 
            // Jika Materi biasa -> Klik untuk edit inline
            // Jika Kuis -> Klik tidak melakukan apa-apa di sini (edit lewat tombol pensil)
            onClick={() => {
                if (!isQuiz) setEditingId(item.id)
            }}
            className={`flex items-center justify-between p-3 rounded-md border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-sm ${!isQuiz ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              {/* [UPDATE] Ikon Berbeda untuk Kuis */}
              <div className={`p-2 rounded-full flex-shrink-0 ${isQuiz ? 'bg-purple-100 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
                 {isQuiz ? <BrainCircuit size={16} /> : <FileText size={16} />}
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 block truncate">{item.title}</span>
                    {/* [BARU] Badge Kuis */}
                    {isQuiz && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">KUIS</span>}
                </div>
                
                <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isLocked ? 'text-orange-600' : 'text-green-600'}`}>
                    {isLocked ? (
                        <><Lock size={10} /> Terkunci</>
                    ) : (
                        <><Unlock size={10} /> Terbuka</>
                    )}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
                {/* TOMBOL REORDER */}
                <div className="flex flex-col mr-2 gap-0.5">
                    <button 
                        // Logic disable: Gak bisa naik kalau urutan paling awal (tapi optional)
                        onClick={async (e) => { 
                            e.stopPropagation(); // PENTING! Agar kartu tidak terbuka
                            e.preventDefault();  // PENTING! Agar form tidak submit (jika ada)
                            await reorderItemAction(item.id, moduleId, classroomId, 'up') 
                        }} 
                        className="text-slate-300 hover:text-indigo-600 p-0.5 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        title="Geser Naik"
                    >
                        <ArrowUp size={14}/>
                    </button>
                    
                    <button 
                        onClick={async (e) => { 
                            e.stopPropagation(); 
                            e.preventDefault();
                            await reorderItemAction(item.id, moduleId, classroomId, 'down') 
                        }} 
                        className="text-slate-300 hover:text-indigo-600 p-0.5 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        title="Geser Turun"
                    >
                        <ArrowDown size={14}/>
                    </button>
                </div>

                {/* [BARU] Tombol Edit Khusus Kuis (Link ke Halaman Lain) */}
                {isQuiz && (
                    <Link 
                        href={`/dashboard/teacher/quiz/${item.content?.quiz_id}`}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors mr-1"
                        title="Edit Soal Kuis"
                    >
                        <Pencil size={14} />
                    </Link>
                )}

                <button 
                    onClick={(e) => {
                        e.stopPropagation()
                        handleToggleLock(item.id, isLocked)
                    }}
                    disabled={loadingLock === item.id}
                    className={`p-2 rounded-md transition-colors mr-2 ${isLocked ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    title={isLocked ? "Buka akses" : "Kunci materi"}
                >
                    {loadingLock === item.id ? (
                        <span className="block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        isLocked ? <Lock size={14} /> : <Unlock size={14} />
                    )}
                </button>

                <button 
                    onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item) // Pass item object, bukan cuma ID
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
          </div>
        )
      })}

      {/* [UPDATE] FORM CREATE ADA DUA JENIS */}
      
      {/* 1. Form Materi Baru */}
      {editingId === 'new-materi' && (
          <div className="bg-white border border-indigo-500 ring-1 ring-indigo-500 p-4 rounded-lg shadow-lg relative animate-in zoom-in-95 duration-200">
             <ItemForm 
                key="new-materi"
                mode="create"
                itemId=""
                initialTitle=""
                initialVideo=""
                initialBody=""
                moduleId={moduleId}
                classroomId={classroomId}
                onClose={handleClose}
             />
          </div>
      )}

      {/* 2. Form Kuis Baru */}
      {editingId === 'new-quiz' && (
          <div className="bg-white border border-purple-500 ring-1 ring-purple-500 p-4 rounded-lg shadow-lg relative animate-in zoom-in-95 duration-200">
             <QuizForm 
                moduleId={moduleId} 
                classroomId={classroomId} 
                onClose={handleClose} 
             />
          </div>
      )}

      {/* TOMBOL PEMICU (TRIGGER BUTTONS) */}
      {!editingId && (
        <div className="flex gap-2 mt-2">
            <button 
              onClick={() => setEditingId('new-materi')}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <Plus size={14} /> Tambah Materi
            </button>
            <button 
              onClick={() => setEditingId('new-quiz')}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100"
            >
              <BrainCircuit size={14} /> Tambah Kuis
            </button>
        </div>
      )}
    </div>
  )
}

// --- ITEM FORM (TEKS & VIDEO) - TIDAK ADA PERUBAHAN LOGIKA DARI KODE LAMA ANDA ---
function ItemForm({ 
    mode, itemId, initialTitle, initialVideo, initialBody, moduleId, classroomId, onClose 
}: {
    mode: 'create' | 'edit',
    itemId: string,
    initialTitle: string,
    initialVideo: string,
    initialBody: string,
    moduleId: string,
    classroomId: string,
    onClose: () => void
}) {
    const [title, setTitle] = useState(initialTitle)
    const [videoUrl, setVideoUrl] = useState(initialVideo)
    const [markdownBody, setMarkdownBody] = useState(initialBody)
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        const formData = new FormData()
        formData.append('moduleId', moduleId)
        formData.append('classroomId', classroomId)
        formData.append('itemId', itemId)
        formData.append('title', title)
        formData.append('videoUrl', videoUrl)
        formData.append('markdownBody', markdownBody)

        if (mode === 'create') {
            await createItemAction(formData)
        } else {
            await updateItemAction(formData)
        }
        setIsSaving(false)
        onClose()
    }

    const handlePreviewNewTab = () => {
        if (mode === 'edit') {
            window.open(`/preview/item/${itemId}`, '_blank')
        } else {
            alert('Simpan materi terlebih dahulu untuk melihat preview.')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                    {mode === 'create' ? <Plus size={14}/> : <Pencil size={14}/>} 
                    {mode === 'create' ? 'Materi Baru' : 'Edit Materi'}
                </span>
                
                <div className="flex gap-2">
                    {mode === 'edit' && (
                        <button 
                            onClick={handlePreviewNewTab}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 transition-colors"
                        >
                            <ExternalLink size={14} /> Preview
                        </button>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
            </div>

            <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul Materi..." 
                className="w-full text-sm border-slate-300 rounded-md px-3 py-2 border font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                    <Youtube size={14} className="text-red-500" /> Video Pembelajaran (Opsional)
                </label>
                <input 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Paste link YouTube..." 
                    className="w-full text-sm border-slate-300 rounded-md px-3 py-2 border focus:border-red-400 outline-none"
                />
            </div>

            <div>
                <div className="flex gap-2 mb-2 border-b border-slate-200">
                    <button onClick={() => setActiveTab('write')} className={`text-xs font-medium px-4 py-2 border-b-2 transition-colors ${activeTab === 'write' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Tulis Materi</button>
                    <button onClick={() => setActiveTab('preview')} className={`text-xs font-medium px-4 py-2 border-b-2 transition-colors ${activeTab === 'preview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Preview</button>
                </div>

                {activeTab === 'write' ? (
                    <div className="relative">
                        <textarea 
                            value={markdownBody}
                            onChange={(e) => setMarkdownBody(e.target.value)}
                            placeholder="Tulis materi (Markdown)..."
                            className="w-full h-64 p-4 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                        />
                         <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 bg-white px-2 rounded border">Markdown Supported</div>
                    </div>
                ) : (
                    <div className="h-64 overflow-y-auto p-4 border border-slate-200 rounded-md bg-white">
                        <MarkdownViewer content={markdownBody} />
                    </div>
                )}
            </div>

            <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white text-xs font-bold py-3 rounded-md hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
                <Save size={16} /> {isSaving ? 'Menyimpan...' : 'SIMPAN MATERI'}
            </button>
        </div>
    )
}

// --- [BARU] QUIZ FORM (FORMULIR BUAT KUIS) ---
function QuizForm({ moduleId, classroomId, onClose }: { moduleId: string, classroomId: string, onClose: () => void }) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        await createQuizAction(formData)
        setLoading(false)
        onClose()
    }

    return (
        <form action={handleSubmit} className="space-y-3">
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="classroomId" value={classroomId} />
            
            <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                <span className="text-xs font-bold text-purple-600 uppercase flex items-center gap-2">
                    <BrainCircuit size={14}/> Kuis Baru
                </span>
                <button type="button" onClick={onClose}><X size={16} className="text-slate-400" /></button>
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Judul Kuis</label>
                <input 
                    name="title" 
                    required 
                    placeholder="Contoh: Kuis Harian 1" 
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Durasi (Menit)</label>
                <input 
                    name="duration" 
                    type="number"
                    defaultValue={30}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 rounded-md text-xs font-bold hover:bg-purple-700 transition-colors"
            >
                {loading ? 'Membuat Kuis...' : 'Buat Kuis'}
            </button>
        </form>
    )
}