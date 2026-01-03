// app/dashboard/teacher/quiz/[quizId]/question-list-item.tsx
'use client'

import { useState } from 'react'
import { Pencil, Trash2, ArrowUp, ArrowDown, CheckCircle2, Circle, AlignLeft, ListChecks } from 'lucide-react'
import MarkdownViewer from '@/components/markdown-viewer'
import QuestionForm from './question-form' // Import form yang tadi kita update
import { reorderQuestionAction, deleteQuestionAction } from '@/app/actions/quiz-questions'

export default function QuestionListItem({ question, index, quizId, totalQuestions }: { question: any, index: number, quizId: string, totalQuestions: number }) {
    const [isEditing, setIsEditing] = useState(false)
    const [loadingOrder, setLoadingOrder] = useState(false)

    const handleReorder = async (direction: 'up' | 'down') => {
        setLoadingOrder(true)
        await reorderQuestionAction(question.id, quizId, direction)
        setLoadingOrder(false)
    }

    // Jika sedang edit, tampilkan Form
    if (isEditing) {
        return <QuestionForm quizId={quizId} initialData={question} onClose={() => setIsEditing(false)} />
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm group hover:border-indigo-300 transition-all relative">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 w-full">
                    {/* Nomor */}
                    <div className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
                        {index + 1}
                    </div>
                    
                    <div className="w-full">
                         {/* Teks Soal dengan Markdown */}
                         <div className="prose prose-sm max-w-none text-slate-900 mb-2">
                             <MarkdownViewer content={question.question_text} />
                         </div>

                         {/* Info Tipe & Bobot */}
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                                {question.question_type === 'short_answer' ? <><AlignLeft size={10}/> Isian</> : <><ListChecks size={10}/> Pilgan</>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Bobot: {question.points} Poin</span>
                         </div>
                    </div>
                </div>
                
                {/* AKSI TOMBOL (Edit, Hapus, Reorder) */}
                <div className="flex flex-col gap-1 ml-2">
                    <div className="flex gap-1">
                         <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-indigo-600 bg-slate-50 rounded hover:bg-indigo-50" title="Edit Soal">
                            <Pencil size={16} />
                         </button>
                         
                         {/* Form Hapus */}
                         <button onClick={async () => { if(confirm('Hapus soal ini?')) await deleteQuestionAction(question.id, quizId) }} className="p-2 text-slate-300 hover:text-red-600 bg-slate-50 rounded hover:bg-red-50" title="Hapus">
                             <Trash2 size={16} />
                         </button>
                    </div>

                    {/* Tombol Reorder (Hanya muncul jika hover group biar rapi, atau selalu muncul) */}
                    <div className="flex flex-col gap-1 mt-1">
                        <button disabled={index === 0 || loadingOrder} onClick={() => handleReorder('up')} className="p-1 text-slate-300 hover:text-slate-600 bg-slate-50 rounded disabled:opacity-30">
                            <ArrowUp size={14} />
                        </button>
                        <button disabled={index === totalQuestions - 1 || loadingOrder} onClick={() => handleReorder('down')} className="p-1 text-slate-300 hover:text-slate-600 bg-slate-50 rounded disabled:opacity-30">
                            <ArrowDown size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Opsi */}
            {question.question_type === 'short_answer' ? (
                 <div className="pl-11">
                    <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 font-medium inline-block">
                        <strong>Kunci Jawaban:</strong> {question.options?.[0]?.option_text}
                    </div>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                    {question.options?.map((opt: any) => (
                        <div key={opt.id} className={`px-4 py-2 rounded-lg text-sm border flex items-center gap-2 ${opt.is_correct ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                            {opt.is_correct ? <CheckCircle2 size={16}/> : <Circle size={16} className="opacity-20"/>}
                            {opt.option_text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}