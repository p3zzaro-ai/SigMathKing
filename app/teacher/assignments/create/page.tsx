import QuizBuilder from "@/components/dashboard/QuizBuilder"

export default function CreateAssignmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Buat Materi & Kuis Baru</h1>
      <QuizBuilder />
    </div>
  )
}