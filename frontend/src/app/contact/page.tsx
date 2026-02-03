"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { School, Phone, Mail, MapPin, Globe, Clock, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast, Toaster } from "sonner"

export default function ContactPage() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings`)
        setInfo(res.data)
      } catch (error) {
        console.error("Failed to load school info")
      } finally {
        setLoading(false)
      }
    }
    fetchInfo()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Pesan terkirim (Demo)")
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <School className="w-6 h-6" />
            SIM-SAPRAS
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Hubungi Kami</h1>
          <p className="text-lg text-slate-600">
            Punya pertanyaan seputar sarana dan prasarana sekolah? Jangan ragu untuk menghubungi kami melalui kontak di bawah ini.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md overflow-hidden bg-white h-full relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="font-bold text-xl mb-6">Informasi Sekolah</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">Alamat</p>
                        <p className="text-slate-600 leading-relaxed">{info.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">Telepon</p>
                        <p className="text-slate-600">{info.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">Email</p>
                        <p className="text-slate-600">{info.email}</p>
                      </div>
                    </div>
                    {info.website && (
                      <div className="flex items-start gap-4">
                        <Globe className="w-6 h-6 text-primary shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-slate-900">Website</p>
                          <a href={info.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{info.website}</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Jam Operasional</p>
                      <p className="text-slate-600">Senin - Jumat: 07:00 - 16:00</p>
                      <p className="text-slate-600">Sabtu - Minggu: Tutup</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-md overflow-hidden bg-white">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-6">Kirim Pesan</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="visitor_name">Nama Lengkap</Label>
                      <Input id="visitor_name" placeholder="Nama Anda" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visitor_email">Email</Label>
                      <Input id="visitor_email" type="email" placeholder="email@contoh.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input id="subject" placeholder="Perihal pesan Anda" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea id="message" placeholder="Tulis pesan Anda di sini..." className="min-h-[150px]" required />
                  </div>
                  <Button type="submit" size="lg" className="h-12 px-8">Kirim Pesan</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
