// app/dashboard/teacher/quiz/[quizId]/question-form.tsx
'use client'

import { useState, useRef } from 'react'
import { createQuestionAction, updateQuestionAction } from '@/app/actions/quiz-questions'
import { Plus, Save, CheckCircle2, Circle, AlignLeft, ListChecks, X } from 'lucide-react'
import MarkdownViewer from '@/components/markdown-viewer'

interface QuestionFormProps {
    quizId: string
    initialData?: any
    onClose?: () => void
}

export default function QuestionForm({ quizId, initialData, onClose }: QuestionFormProps) {
  const [isOpen, setIsOpen] = useState(!!initialData) 
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  
  const [questionText, setQuestionText] = useState(initialData?.question_text || '')
  const [points, setPoints] = useState(initialData?.points || 10)
  const [qType, setQType] = useState<'multiple_choice' | 'short_answer'>(initialData?.question_type || 'multiple_choice')
  
  const initialOptions = initialData?.options?.map((o: any) => o.option_text) || ['', '', '', '']
  const [options, setOptions] = useState<string[]>(initialOptions)
  
  const initialCorrectIdx = initialData?.options?.findIndex((o: any) => o.is_correct) 
  const [correctIndex, setCorrectIndex] = useState<number>(initialCorrectIdx >= 0 ? initialCorrectIdx : 0)
  
  const initialAnswerKey = initialData?.options?.[0]?.option_text || ''
  const [answerKey, setAnswerKey] = useState(initialAnswerKey)
  
  const formRef = useRef<HTMLFormElement>(null)

  const addOption = () => { if(options.length < 5) setOptions([...options, '']) }
  const removeOption = (idx: number) => {
      if(options.length > 2) {
          const newOpts = options.filter((_, i) => i !== idx)
          setOptions(newOpts)
          if(correctIndex >= idx && correctIndex > 0) setCorrectIndex(correctIndex - 1)
      }
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    formData.append('questionType', qType)
    formData.set('questionText', questionText) 
    
    if (qType === 'multiple_choice') {
        formData.append('correctIndex', correctIndex.toString())
    }

    if (initialData) {
        formData.append('questionId', initialData.id)
        await updateQuestionAction(formData)
        if(onClose) onClose()
    } else {
        await createQuestionAction(formData)
        setQuestionText('')
        setOptions(['', '', '', ''])
        setCorrectIndex(0)
        setIsOpen(false)
        formRef.current?.reset()
    }
    
    setLoading(false)
  }

  if (!isOpen && !initialData) {
    return (
        <button 
            onClick={() => setIsOpen(true)}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all gap-2"
        >
            <div className="bg-white p-2 rounded-full shadow-sm">
                <Plus size={24} />
            </div>
            <span className="font-bold">Tambah Soal Baru</span>
        </button>
    )
  }

  return (
    <div className={`bg-white border p-6 rounded-xl shadow-lg animate-in zoom-in-95 ${initialData ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}>
        <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                {initialData ? <AlignLeft size={18} className="text-indigo-600"/> : <Plus size={18} className="text-indigo-600"/>}
                {initialData ? 'Edit Soal' : 'Buat Soal Baru'}
            </h3>
            
            <div className="flex gap-2">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setQType('multiple_choice')} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${qType === 'multiple_choice' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                        <ListChecks size={14}/> Pilgan
                    </button>
                    <button type="button" onClick={() => setQType('short_answer')} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${qType === 'short_answer' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                        <AlignLeft size={14}/> Isian
                    </button>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                )}
                {!initialData && (
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                )}
            </div>
        </div>

        <form ref={formRef} action={handleSubmit} className="space-y-6">
            <input type="hidden" name="quizId" value={quizId} />

            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                     <div className="flex justify-between items-end">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Pertanyaan (Support LaTeX/Math)</label>
                        <div className="flex gap-2">
                             <button type="button" onClick={()=>setActiveTab('write')} className={`text-[10px] px-2 py-1 rounded border ${activeTab==='write'?'bg-indigo-50 border-indigo-200 text-indigo-700':'bg-white'}`}>Write</button>
                             <button type="button" onClick={()=>setActiveTab('preview')} className={`text-[10px] px-2 py-1 rounded border ${activeTab==='preview'?'bg-indigo-50 border-indigo-200 text-indigo-700':'bg-white'}`}>Preview</button>
                        </div>
                     </div>
                     
                     {activeTab === 'write' ? (
                        <div className="relative">
                            <textarea 
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                required 
                                rows={3}
                                placeholder="Tulis soal... Gunakan $rumus$ untuk matematika." 
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                            />
                            {/* --- PERBAIKAN LINE DI BAWAH INI (GUNAKAN CURLY BRACES DAN DOUBLE BACKSLASH) --- */}
                            <p className="text-[10px] text-slate-400 mt-1">Contoh Math: {'$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$'}</p>
                            {/* ------------------------------------------------------------------------------- */}
                        </div>
                     ) : (
                        <div className="w-full border border-slate-200 rounded-lg p-4 bg-slate-50 min-h-[100px]">
                            <MarkdownViewer content={questionText || 'Belum ada teks...'} />
                        </div>
                     )}
                </div>

                <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bobot Poin</label>
                     <input 
                        name="points" 
                        type="number" 
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold"
                     />
                </div>
            </div>

            {qType === 'multiple_choice' ? (
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Opsi Jawaban</label>
                        <div className="flex gap-2">
                             {options.length > 2 && <button type="button" onClick={() => removeOption(options.length -1)} className="text-xs text-red-500 px-2">Kurang</button>}
                             {options.length < 5 && <button type="button" onClick={addOption} className="text-xs text-indigo-600 font-bold px-2">Tambah</button>}
                        </div>
                    </div>
                    {options.map((opt, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${correctIndex === idx ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                            <button type="button" onClick={() => setCorrectIndex(idx)} className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${correctIndex === idx ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                {correctIndex === idx ? <CheckCircle2 size={18}/> : <span className="font-bold text-xs">{String.fromCharCode(65 + idx)}</span>}
                            </button>
                            <input 
                                name={`option_${idx}`} 
                                value={opt} 
                                onChange={(e) => {
                                    const newOpts = [...options]; newOpts[idx] = e.target.value; setOptions(newOpts)
                                }}
                                required placeholder={`Pilihan ${String.fromCharCode(65 + idx)}...`} className="flex-1 bg-transparent border-none outline-none text-sm" 
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <label className="block text-xs font-bold text-yellow-700 uppercase mb-2">Kunci Jawaban Benar</label>
                    <input name="answerKey" value={answerKey} onChange={(e)=>setAnswerKey(e.target.value)} required placeholder="Jawaban singkat..." className="w-full border border-yellow-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-500 outline-none font-medium"/>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                {onClose && <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500">Batal</button>}
                {!onClose && <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-500">Batal</button>}
                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                    {loading ? 'Menyimpan...' : <><Save size={16}/> Simpan Soal</>}
                </button>
            </div>
        </form>
    </div>
  )
}