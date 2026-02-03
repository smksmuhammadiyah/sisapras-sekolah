"use client";

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface QRGeneratorProps {
  value: string;
  label: string;
  code: string;
}

export function QRGenerator({ value, label, code }: QRGeneratorProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `QR-${code}`,
  });

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-white shadow-sm w-fit">
      <div ref={componentRef} className="p-4 bg-white border-2 border-slate-900 w-[200px] h-[250px] flex flex-col items-center justify-center text-center">
        {/* Printable Area - Styles MUST be inline or tailwind standard for print */}
        <h3 className="text-xs font-bold uppercase mb-2">Milik Sekolah</h3>
        <QRCodeSVG value={value} size={120} level="H" />
        <div className="mt-2">
          <p className="text-xs font-mono font-bold">{code}</p>
          <p className="text-[10px] text-slate-500 truncate w-[160px]">{label}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={() => handlePrint()} className="w-full">
        <Printer className="w-4 h-4 mr-2" /> Cetak Label
      </Button>
    </div>
  );
}
