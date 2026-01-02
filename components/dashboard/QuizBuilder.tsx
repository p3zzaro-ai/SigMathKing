'use client'

import { useState } from 'react'
import { createAssignment } from '@/app/teacher/assignments/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Trash2, Save, Video, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Tipe data untuk soal
type Question = {
  type: 'multiple_choice' | 'short_answer'
  question: string
  options: string[] // Hanya dipakai jika multiple_choice
  correct: string
}

export default function QuizBuilder() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  
  // Default: 1 soal Pilihan Ganda dengan 4 opsi
  const [questions, setQuestions] = useState<Question[]>([
    { type: 'multiple_choice', question: '', options: ['', '', '', ''], correct: '' }
  ])

  // --- LOGIKA UTAMA ---

  const addQuestion = () => {
    setQuestions([
      ...questions, 
      { type: 'multiple_choice', question: '', options: ['', '', '', ''], correct: '' }
    ])
  }

  const removeQuestion = (index: number) => {
    const newQ = [...questions]
    newQ.splice(index, 1)
    setQuestions(newQ)
  }

  const updateField = (index: number, field: keyof Question, value: any) => {
    const newQ = [...questions]
    // @ts-ignore
    newQ[index][field] = value
    setQuestions(newQ)
  }

  // --- LOGIKA OPSI (ABCDE) ---

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    const newQ = [...questions]
    newQ[qIndex].options[oIndex] = text
    setQuestions(newQ)
  }

  const addOption = (qIndex: number) => {
    const newQ = [...questions]
    if (newQ[qIndex].options.length < 5) {
      newQ[qIndex].options.push('') // Tambah opsi kosong
      setQuestions(newQ)
    }
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQ = [...questions]
    if (newQ[qIndex].options.length > 2) {
      newQ[qIndex].options.splice(oIndex, 1)
      
      // Jika yang dihapus adalah kunci jawaban, reset kunci
      const deletedValue = newQ[qIndex].options[oIndex]
      if (newQ[qIndex].correct === deletedValue) {
        newQ[qIndex].correct = ''
      }
      setQuestions(newQ)
    }
  }

  // --- SIMPAN ---

  const handleSave = async () => {
    // Validasi sederhana
    if (!title) return alert('Judul harus diisi')
    
    setLoading(true)
    const payload = {
      title,
      type: 'quiz',
      video_url: videoUrl,
      questions 
    }

    const res = await createAssignment(payload)
    
    setLoading(false)
    if (res?.success) {
      alert('Kuis berhasil dibuat!')
      router.push('/teacher/assignments')
    } else {
      alert('Gagal menyimpan.')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* HEADER CARD */}
      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <div>
          <Label>Judul Materi / Kuis</Label>
          <Input 
            placeholder="Contoh: Trigonometri Dasar" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        
        <div>
          <Label className="flex items-center gap-2">
            <Video className="w-4 h-4" /> Link Video Youtube (Manim)
          </Label>
          <Input 
            placeholder="https://youtube.com/..." 
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>
      </div>

      {/* LIST SOAL */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Daftar Soal</h3>
        
        {questions.map((q, qIndex) => (
          <Card key={qIndex} className="relative overflow-hidden">
            {/* Header Soal: Nomor & Tipe */}
            <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <span className="font-bold text-slate-700">Soal {qIndex + 1}</span>
                <select 
                  className="text-xs p-1 rounded border bg-white"
                  value={q.type}
                  onChange={(e) => updateField(qIndex, 'type', e.target.value)}
                >
                  <option value="multiple_choice">Pilihan Ganda</option>
                  <option value="short_answer">Isian Singkat</option>
                </select>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                onClick={() => removeQuestion(qIndex)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Pertanyaan</Label>
                <Input 
                  placeholder="Tulis pertanyaan..." 
                  value={q.question}
                  onChange={(e) => updateField(qIndex, 'question', e.target.value)}
                />
              </div>

              {/* JIKA PILIHAN GANDA */}
              {q.type === 'multiple_choice' && (
                <div className="space-y-3">
                  <Label>Opsi Jawaban (Min 2, Max 5)</Label>
                  <div className="grid gap-3">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        {/* Radio Button untuk Kunci Jawaban */}
                        <input 
                          type="radio" 
                          name={`correct-${qIndex}`}
                          checked={q.correct === opt && opt !== ''}
                          onChange={() => updateField(qIndex, 'correct', opt)}
                          className="w-5 h-5 text-blue-600 cursor-pointer"
                        />
                        
                        {/* Input Opsi */}
                        <Input 
                          placeholder={`Pilihan ${String.fromCharCode(65 + oIndex)}`}
                          value={opt}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className={q.correct === opt && opt !== '' ? "border-blue-500 bg-blue-50 flex-1" : "flex-1"}
                        />

                        {/* Tombol Hapus Opsi (Hanya jika > 2) */}
                        <button 
                          onClick={() => removeOption(qIndex, oIndex)}
                          disabled={q.options.length <= 2}
                          className="text-slate-400 hover:text-red-500 disabled:opacity-30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Tombol Tambah Opsi (Max 5) */}
                  {q.options.length < 5 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addOption(qIndex)}
                      className="text-xs mt-2"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Tambah Opsi
                    </Button>
                  )}
                  <p className="text-xs text-slate-400 mt-1">*Klik lingkaran untuk set kunci jawaban.</p>
                </div>
              )}

              {/* JIKA ISIAN SINGKAT */}
              {q.type === 'short_answer' && (
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <Label className="text-yellow-800">Kunci Jawaban Singkat</Label>
                  <Input 
                    placeholder="Contoh: 45 atau x=2"
                    value={q.correct}
                    onChange={(e) => updateField(qIndex, 'correct', e.target.value)}
                    className="mt-1 bg-white"
                  />
                  <p className="text-xs text-yellow-700 mt-2">
                    *Siswa harus mengetik jawaban <strong>persis</strong> seperti ini (tidak case-sensitive).
                  </p>
                </div>
              )}

            </CardContent>
          </Card>
        ))}

        <Button onClick={addQuestion} variant="outline" className="w-full border-dashed py-8">
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Soal Baru
        </Button>
      </div>

      <div className="flex justify-end sticky bottom-4">
        <Button onClick={handleSave} disabled={loading} size="lg" className="shadow-xl">
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Menyimpan...' : 'Simpan Kuis'}
        </Button>
      </div>
    </div>
  )
}