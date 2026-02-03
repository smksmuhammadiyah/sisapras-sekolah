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
import { Upload, FileSpreadsheet, Loader2, AlertTriangle, CheckCircle2, Download } from "lucide-react"
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

export function AssetImportDialog({ onSuccess }: { onSuccess: () => void }) {
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

        // Basic mapping or validation could happen here
        // We assume headers: Name, Category, Condition, PurchaseDate, Price, RoomId (optional)
        // Normalize keys to match DTO if needed
        const mappedData = jsonData.map((row: any) => ({
          name: row['Nama Aset'] || row['name'],
          category: row['Kategori'] || row['category'] || 'GENERAL',
          condition: row['Kondisi'] || row['condition'] || 'GOOD',
          purchaseDate: row['Tanggal Beli'] || row['purchaseDate'] || new Date().toISOString(),
          price: Number(row['Harga'] || row['price'] || 0),
          // Default optional fields
          roomId: null
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
      // Validate or Transform data to match DTO strictness
      // e.g. ensure Category is string, PurchaseDate is date string
      const validData = data.map(item => ({
        ...item,
        purchaseDate: new Date(item.purchaseDate).toISOString()
      }))

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/assets/bulk`,
        validData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )

      toast.success(`${data.length} Aset berhasil diimport`)
      setOpen(false)
      onSuccess()
      // Reset
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
      { "Nama Aset": "Laptop Lenovo Thinkpad", "Kategori": "Elektronik", "Kondisi": "GOOD", "Tanggal Beli": "2024-01-15", "Harga": 15000000 },
      { "Nama Aset": "Meja Kantor", "Kategori": "Furniture", "Kondisi": "GOOD", "Tanggal Beli": "2024-01-20", "Harga": 2500000 }
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template")
    XLSX.writeFile(wb, "Template_Import_Aset.xlsx")
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
          <DialogTitle>Import Aset via Excel</DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx) berisi daftar aset baru.
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
              <p className="text-sm text-muted-foreground">atau drag & drop file di sini</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setData([]) }}>Ganti File</Button>
              </div>

              {isProcessing ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Membaca file...
                </div>
              ) : (
                <div className="border rounded-md max-h-[300px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Aset</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead>Tgl Beli</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.condition}</TableCell>
                          <TableCell>{row.purchaseDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Perhatian</AlertTitle>
                <AlertDescription>
                  Pastikan format kolom sesuai Template. {data.length} data siap diimport.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isUploading || data.length === 0}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Proses Import
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
