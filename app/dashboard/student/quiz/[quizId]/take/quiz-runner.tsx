// app/dashboard/student/quiz/[quizId]/take/quiz-runner.tsx
'use client'

import { useState, useEffect } from 'react'
import { submitQuizAction } from '@/app/actions/student-quiz'
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import MarkdownViewer from '@/components/markdown-viewer'

interface QuizRunnerProps {
    quiz: any
    questions: any[]
}

export default function QuizRunner({ quiz, questions }: QuizRunnerProps) {
    const router = useRouter()
    const [currentIdx, setCurrentIdx] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeLeft, setTimeLeft] = useState(quiz.duration * 60) // Detik
    const [submitting, setSubmitting] = useState(false)

    // 1. Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit() // Auto submit jika waktu habis
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Format Waktu (MM:SS)
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    // 2. Handle Jawaban
    const handleAnswer = (val: string) => {
        const qId = questions[currentIdx].id
        setAnswers({ ...answers, [qId]: val })
    }

    // 3. Submit
    const handleSubmit = async () => {
        if (submitting) return
        if (!confirm('Yakin ingin mengumpulkan jawaban?')) return

        setSubmitting(true)
        const res = await submitQuizAction(quiz.id, answers)
        
        if (res?.success) {
            router.push(res.redirectUrl as string)
        } else {
            alert('Gagal submit: ' + res?.error)
            setSubmitting(false)
        }
    }

    const currentQ = questions[currentIdx]
    const isLast = currentIdx === questions.length - 1

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* TOP BAR (Timer & Navigasi Cepat) */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-sm">
                <h2 className="font-bold text-slate-700 truncate max-w-[200px]">{quiz.title}</h2>
                <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-6">
                
                {/* NOMOR SOAL NAVIGATOR */}
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {questions.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentIdx(idx)}
                            className={`w-8 h-8 rounded-full flex-shrink-0 text-xs font-bold border transition-all ${
                                currentIdx === idx 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : answers[questions[idx].id] 
                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                                    : 'bg-white text-slate-400 border-slate-200'
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                {/* AREA SOAL */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                            Soal No. {currentIdx + 1}
                        </span>
                        <span className="text-xs text-slate-400">Bobot: {currentQ.points} Poin</span>
                    </div>

                    <div className="prose prose-lg max-w-none text-slate-800 mb-8 flex-1">
                        <MarkdownViewer content={currentQ.question_text} />
                    </div>

                    {/* PILIHAN JAWABAN */}
                    <div className="space-y-3">
                        {currentQ.question_type === 'multiple_choice' ? (
                             currentQ.options.map((opt: any, i: number) => {
                                 const isSelected = answers[currentQ.id] === opt.option_text
                                 return (
                                     <button
                                        key={opt.id}
                                        onClick={() => handleAnswer(opt.option_text)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                            isSelected 
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-medium' 
                                            : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                     >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span className="text-sm">{opt.option_text}</span>
                                     </button>
                                 )
                             })
                        ) : (
                            // ISIAN SINGKAT
                            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                                <label className="block text-sm font-bold text-yellow-800 mb-2">Jawaban Anda:</label>
                                <input 
                                    type="text" 
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                    placeholder="Ketik jawaban di sini..."
                                    className="w-full p-3 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none font-medium"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR (Navigasi Next/Prev) */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <button 
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className="px-4 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-2"
                    >
                        <ChevronLeft size={20} /> Sebelumnya
                    </button>

                    {isLast ? (
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 flex items-center gap-2"
                        >
                            {submitting ? 'Menilai...' : <><CheckCircle size={18}/> Kumpulkan</>}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                        >
                            Selanjutnya <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}