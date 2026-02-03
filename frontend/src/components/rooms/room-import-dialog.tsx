"use client"

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileSpreadsheet, Loader2, AlertTriangle, Download } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RoomImportDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseExcel(selectedFile)
    }
  }

  const parseExcel = (file: File) => {
    setIsProcessing(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const ab = e.target?.result
        const workbook = XLSX.read(ab, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Map data
        const mappedData = jsonData.map((row: any) => ({
          name: row['Nama Ruangan'] || row['name'],
          type: row['Tipe'] || row['type'] || 'CLASSROOM',
          location: row['Lokasi'] || row['location'] || 'Lantai 1',
          capacity: Number(row['Kapasitas'] || row['capacity'] || 30),
          description: row['Deskripsi'] || row['description'] || ''
        }))

        setData(mappedData)
      } catch (error) {
        toast.error("Gagal membaca file Excel")
        console.error(error)
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleSubmit = async () => {
    if (data.length === 0) return

    setIsUploading(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/rooms/bulk`,
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )

      toast.success(`${data.length} Ruangan berhasil diimport`)
      setOpen(false)
      onSuccess()
      setData([])
      setFile(null)
    } catch (error) {
      console.error(error)
      toast.error("Gagal mengimport data. Periksa format.")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      { "Nama Ruangan": "Lab Komputer 1", "Tipe": "LAB", "Lokasi": "Gedung A, Lt 2", "Kapasitas": 36, "Deskripsi": "Ruang Lab utama" },
      { "Nama Ruangan": "Kelas X TG", "Tipe": "CLASSROOM", "Lokasi": "Gedung B, Lt 1", "Kapasitas": 32, "Deskripsi": "Kelas Teori" }
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template")
    XLSX.writeFile(wb, "Template_Import_Ruangan.xlsx")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Ruangan via Excel</DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx) data ruangan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-2">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <p className="font-medium">Klik untuk upload file Excel</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setData([]) }}>Ganti File</Button>
              </div>

              {isProcessing ? (
                <div className="text-center py-4"><Loader2 className="animate-spin inline-block mr-2" /> Memproses...</div>
              ) : (
                <div className="border rounded-md max-h-[300px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Ruangan</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Kapasitas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell>{row.location}</TableCell>
                          <TableCell>{row.capacity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  {data.length} ruangan siap ditambahkan. Pastikan Tipe Ruangan sesuai (CLASSROOM, LAB, OFFICE, etc).
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isUploading || data.length === 0}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Import
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
