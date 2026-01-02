import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// 1. Ubah tipe props menjadi Promise
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  // 2. Tunggu (await) data searchParams sebelum digunakan
  const params = await searchParams
  const message = params.message

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Math Mastery 10</CardTitle>
          <CardDescription>Masuk untuk mulai belajar.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tampilkan Pesan Error Jika Ada */}
          {message && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm">
              {message}
            </div>
          )}

          <form action={login} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="nama@sekolah.id" required />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="full_name">Nama Lengkap (Khusus Siswa Baru)</Label>
              <Input id="full_name" name="full_name" type="text" placeholder="Budi Santoso" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            <Button type="submit" className="w-full">Masuk / Daftar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}