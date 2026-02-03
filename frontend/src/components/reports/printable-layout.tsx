import React, { forwardRef } from 'react';
import { School } from 'lucide-react';

export interface ReportHeaderData {
  schoolName: string;
  agency: string; // Dinas Pendidikan
  province: string; // Pemerintah Provinsi
  address: string;
  contacts: string;
}

export interface SignatureData {
  role: string;
  name: string;
  nip: string;
}

interface PrintableLayoutProps {
  title: string;
  subtitle?: string;
  filterDates?: string;
  headerData?: ReportHeaderData;
  onHeaderChange?: (field: keyof ReportHeaderData, value: string) => void;
  signatures: SignatureData[];
  onSignatureChange?: (index: number, field: keyof SignatureData, value: string) => void;
  children: React.ReactNode;
}

export const PrintableLayout = forwardRef<HTMLDivElement, PrintableLayoutProps>(
  ({ title, subtitle, filterDates, headerData, onHeaderChange, signatures, onSignatureChange, children }, ref) => {

    // Default data if not provided (fallback)
    const defaults: ReportHeaderData = {
      province: "PEMERINTAH PROVINSI JAWA BARAT",
      agency: "DINAS PENDIDIKAN",
      schoolName: "SMK NEGERI 1 CONTOH",
      address: "Jl. Pendidikan No. 123, Kota Bandung, Jawa Barat 40123",
      contacts: "Telp: (022) 1234567 | Email: info@smkn1contoh.sch.id | Website: www.smkn1contoh.sch.id"
    };

    const data = headerData || defaults;

    // Helper to render editable field
    const renderEditable = (
      field: keyof ReportHeaderData,
      value: string,
      className: string,
      multiline = false
    ) => {
      // If no handler, just render text
      if (!onHeaderChange) return <div className={className}>{value}</div>;

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onHeaderChange(field, e.target.value);
      };

      if (multiline) {
        return (
          <textarea
            value={value}
            onChange={handleChange}
            className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-gray-50 focus:bg-gray-100 p-1 rounded transition-colors placeholder:text-gray-300 text-center ${className}`}
            rows={2}
          />
        );
      }
      return (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className={`w-full bg-transparent outline-none hover:bg-gray-50 focus:bg-gray-100 p-0.5 rounded transition-colors placeholder:text-gray-300 text-center ${className}`}
        />
      );
    };

    return (
      <div className="w-full bg-gray-100 print:bg-white p-4 print:p-0 overflow-auto flex justify-center">
        {/* Paper Container - Visualized as A4 in Preview */}
        <div ref={ref} className="bg-white text-black shadow-lg print:shadow-none p-[15mm] w-[210mm] min-h-[297mm] print:w-full print:min-h-0 mx-auto box-border flex flex-col">
          <style type="text/css" media="print">
            {`
              @page { size: A4 portrait; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; }
              table { width: 100%; border-collapse: collapse; }
              thead { display: table-header-group; }
              tr { page-break-inside: avoid; }
              input, textarea { border: none !important; background: transparent !important; padding: 0 !important; }
              .no-print { display: none !important; }
            `}
          </style>

          {/* KOP SURAT */}
          <div className="border-b-4 border-double border-black pb-4 mb-6 flex items-center gap-6 print:gap-4">
            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center relative group border border-transparent hover:border-gray-200 rounded">
              {/* Logo matches strict 70px height rule */}
              <School className="w-full h-full text-black object-contain max-h-[70px]" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center uppercase leading-tight font-serif tracking-wide">
              {renderEditable('province', data.province, "text-lg font-medium")}
              {renderEditable('agency', data.agency, "text-xl font-bold")}
              {renderEditable('schoolName', data.schoolName, "text-2xl font-black my-1 tracking-widest")}

              {/* Normal case for Address */}
              <div className="w-full mt-1">
                {renderEditable('address', data.address, "text-sm font-normal normal-case font-sans", true)}
              </div>
              <div className="w-full">
                {renderEditable('contacts', data.contacts, "text-sm font-normal normal-case font-sans", true)}
              </div>
            </div>
          </div>

          {/* REPORT TITLE */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4 mb-2">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 font-medium uppercase">{subtitle}</p>}
            {filterDates && <p className="text-sm text-gray-500 mt-1 italic">Periode: {filterDates}</p>}
          </div>

          {/* MAIN CONTENT TABLE */}
          <div className="flex-1 mb-8 w-full">
            {children}
          </div>

          {/* SIGNATURE BLOCK */}
          <div className="mt-8 flex justify-between px-8 text-center break-inside-avoid">
            {signatures.map((sig, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[200px]">
                {/* Date Placeholder: Only content on Right side (index 1), but occupies space on Left to align Roles */}
                <div className="h-6 mb-1 w-full">
                  {idx === signatures.length - 1 ? (
                    <p className="text-sm">
                      Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  ) : (
                    <div className="w-full h-full"></div> /* Phantom spacer for alignment */
                  )}
                </div>

                {/* Editable Role */}
                <input
                  value={sig.role}
                  onChange={(e) => onSignatureChange?.(idx, 'role', e.target.value)}
                  className="font-semibold mb-20 text-center bg-transparent outline-none hover:bg-gray-50 focus:bg-gray-100 rounded w-full"
                />

                {/* Editable Name */}
                <input
                  value={sig.name}
                  onChange={(e) => onSignatureChange?.(idx, 'name', e.target.value)}
                  className="font-bold underline text-center bg-transparent outline-none hover:bg-gray-50 focus:bg-gray-100 rounded w-full"
                />

                {/* Editable NIP */}
                <div className="flex items-center justify-center gap-1 w-full text-sm">
                  <span>NIP.</span>
                  <input
                    value={sig.nip}
                    onChange={(e) => onSignatureChange?.(idx, 'nip', e.target.value)}
                    className="bg-transparent outline-none hover:bg-gray-50 focus:bg-gray-100 rounded min-w-[100px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

PrintableLayout.displayName = 'PrintableLayout';
