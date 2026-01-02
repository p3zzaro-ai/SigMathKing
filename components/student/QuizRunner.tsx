'use client'

import { useState } from 'react'
import { submitQuiz } from '@/app/student/assignments/[id]/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

// Props: Data soal tanpa kunci jawaban
export default function QuizRunner({ assignmentId, questions, videoUrl }: any) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleAnswer = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }))
  }

  const handleSubmit = async () => {
    // Validasi: Pastikan semua dijawab? (Opsional, di sini kita biarkan kosong boleh)
    const confirm = window.confirm("Yakin ingin mengumpulkan? Jawaban tidak bisa diubah setelah ini.")
    if (!confirm) return

    setSubmitting(true)
    await submitQuiz(assignmentId, answers)
    // Redirect ditangani oleh server action
  }

  // Helper untuk embed YouTube
  const getEmbedUrl = (url: string) => {
    if (!url) return null
    // Ubah watch?v=ID menjadi embed/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null
  }

  const embedUrl = getEmbedUrl(videoUrl)

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      
      {/* Video Section */}
      {embedUrl && (
        <Card className="overflow-hidden bg-black">
          <div className="aspect-video w-full">
            <iframe 
              width="100%" 
              height="100%" 
              src={embedUrl} 
              title="Materi Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="border-0"
            />
          </div>
          <div className="p-4 bg-slate-900 text-white text-center text-sm">
            Tonton video di atas sebelum mengerjakan soal.
          </div>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q: any, index: number) => (
          <Card key={index}>
            <div className="bg-slate-50 p-4 border-b font-semibold text-slate-700">
              Soal No. {index + 1}
            </div>
            <CardContent className="pt-6">
              <p className="text-lg mb-6">{q.question}</p>

              {q.type === 'multiple_choice' ? (
                // Pilihan Ganda
                <RadioGroup 
                  onValueChange={(val) => handleAnswer(index, val)}
                  value={answers[index] || ""}
                  className="space-y-3"
                >
                  {q.options.map((opt: string, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <RadioGroupItem value={opt} id={`q${index}-opt${optIndex}`} />
                      <Label htmlFor={`q${index}-opt${optIndex}`} className="flex-1 cursor-pointer">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                // Isian Singkat
                <div className="space-y-2">
                  <Label>Jawaban Anda:</Label>
                  <Input 
                    placeholder="Ketik jawaban singkat..." 
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswer(index, e.target.value)}
                    className="max-w-md"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center md:pl-64">
        <Button 
          size="lg" 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full md:w-auto min-w-[200px] shadow-xl"
        >
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengumpulkan...</>
          ) : (
            'Kirim Jawaban'
          )}
        </Button>
      </div>

    </div>
  )
}