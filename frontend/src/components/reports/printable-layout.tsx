import React, { forwardRef } from 'react';
import { School } from 'lucide-react';

export interface ReportHeaderData {
  schoolName: string;
  agency: string; // Dinas Pendidikan
  province: string; // Pemerintah Provinsi
  address: string;
  contacts: string;
  logoLeft?: string;
  logoRight?: string;
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
      province: "PIMPINAN CABANG MUHAMMADIYAH SATUI",
      agency: "MAJELIS PENDIDIKAN DASAR DAN MENENGAH",
      schoolName: "SMKS MUHAMMADIYAH SATUI",
      address: "Jl. KH. Ahmad Dahlan, No.07 Ds. Makmur Jaya, Kec. Satui, Kab. Tanah Bumbu (72275)",
      contacts: "NSPN : 69772942 NISS : 32215511 03 007 Telp: 081254721126/08525104559 - Email:smk.muhammadiyahsatui@gmail.com",
      logoLeft: "", // Default empty
      logoRight: "" // Default empty
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

    // Helper for Logo Upload
    const renderLogo = (position: 'left' | 'right', logoUrl?: string) => {
      const fieldName = position === 'left' ? 'logoLeft' : 'logoRight';

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onHeaderChange) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            onHeaderChange(fieldName, base64);
          };
          reader.readAsDataURL(file);
        }
      };

      return (
        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center relative group">
          {/* If editing enabled, show input overlay */}
          {onHeaderChange && (
            <label className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center rounded z-10 transition-opacity">
              <span className="text-[10px] font-bold bg-white/80 px-1 py-0.5 rounded shadow-sm text-black">Ubah Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}

          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
          ) : (
            <div className={`w-full h-full bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-center text-gray-400 ${!onHeaderChange ? 'opacity-0' : ''}`}>
              {position === 'left' ? 'Logo Kiri' : 'Logo Kanan'}
            </div>
          )}
        </div>
      );
    };

    return (
      <div ref={ref} className="w-full bg-slate-100 print:bg-white p-4 print:p-0 overflow-auto flex justify-center items-start">
        {/* Paper Container - Visualized as A4 Landscape in Preview */}
        <div
          id="print-area"
          className="bg-white text-black shadow-lg print:shadow-none p-[10mm] md:p-[15mm] min-w-[297mm] min-h-[210mm] print:w-full print:min-h-0 mx-auto box-border flex flex-col mb-10 print:m-0 print:mb-0"
        >
          <style type="text/css" media="print">
            {`
                @page { 
                  size: A4 landscape; 
                  margin: 10mm; 
                }
                body * {
                  visibility: hidden;
                }
                #print-area, #print-area * {
                  visibility: visible;
                }
                #print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0;
                  padding: 10mm;
                }
                body { 
                  -webkit-print-color-adjust: exact; 
                  print-color-adjust: exact;
                  background: white !important;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  font-size: 10px;
                }
                thead { 
                  display: table-header-group; 
                }
                tfoot {
                  display: table-footer-group;
                }
                tr { 
                  page-break-inside: avoid; 
                }
                td, th {
                  padding: 4px 6px;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                input, textarea { 
                  border: none !important; 
                  background: transparent !important; 
                  padding: 0 !important; 
                  width: 100%;
                  text-align: inherit;
                }
                .no-print { 
                  display: none !important; 
                }
                .break-inside-avoid {
                  break-inside: avoid;
                  page-break-inside: avoid;
                }
              `}
          </style>

          {/* KOP SURAT */}
          <div className="border-b-4 border-double border-black pb-2 mb-6 relative">
            {/* 3-Column Grid Layout for Precise Alignment */}
            <div className="grid grid-cols-[100px_1fr_100px] items-center gap-4 px-4">

              {/* Left Logo */}
              <div className="flex justify-center">
                {renderLogo('left', data.logoLeft)}
              </div>

              {/* Center Text */}
              <div className="flex flex-col items-center justify-center text-center font-serif tracking-normal text-black w-full overflow-hidden">
                {renderEditable('province', data.province, "text-lg font-bold uppercase mb-0 leading-tight text-black w-full whitespace-pre-wrap", true)}
                {renderEditable('agency', data.agency, "text-xl font-bold uppercase mb-1 leading-tight text-black w-full whitespace-pre-wrap", true)}
                {renderEditable('schoolName', data.schoolName, "text-3xl font-black uppercase mb-1 tracking-wide leading-none font-serif text-black w-full whitespace-pre-wrap", true)}

                <div className="w-full px-4">
                  {renderEditable('address', data.address, "text-sm font-normal normal-case font-serif text-black w-full leading-tight", true)}
                </div>
                <div className="w-full -mt-1">
                  {renderEditable('contacts', data.contacts, "text-sm font-normal normal-case font-serif text-black w-full leading-tight", true)}
                </div>
              </div>

              {/* Right Logo */}
              <div className="flex justify-center">
                {renderLogo('right', data.logoRight)}
              </div>

            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"></div>
            <div className="absolute bottom-[6px] left-0 right-0 h-[1px] bg-black"></div>
          </div>

          {/* REPORT TITLE */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4 mb-2">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 font-medium uppercase">{subtitle}</p>}
            {filterDates && <p className="text-sm text-gray-500 mt-1 italic">Periode: {filterDates}</p>}
          </div>

          {/* MAIN CONTENT TABLE */}
          <div className="flex-1 mb-8 w-full overflow-hidden">
            {children}
          </div>

          {/* SIGNATURE BLOCK */}
          <div className="mt-8 flex justify-between px-8 text-center break-inside-avoid">
            {signatures.map((sig, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[200px] max-w-[300px]">
                <div className="h-6 mb-1 w-full flex justify-center items-center">
                  {idx === signatures.length - 1 ? (
                    <p className="text-sm whitespace-nowrap">
                      Satui, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>

                <input
                  value={sig.role}
                  onChange={(e) => onSignatureChange?.(idx, 'role', e.target.value)}
                  className="font-semibold mb-20 text-center bg-transparent outline-none hover:bg-gray-50 focus:bg-gray-100 rounded w-full break-words"
                />

                <textarea
                  value={sig.name}
                  onChange={(e) => onSignatureChange?.(idx, 'name', e.target.value)}
                  className="font-bold underline text-center bg-transparent outline-none hover:bg-gray-50 focus:bg-gray-100 rounded w-full break-words whitespace-normal resize-none overflow-hidden"
                  rows={2}
                />

                <div className="flex items-center justify-center gap-1 w-full text-sm">
                  <span className="shrink-0">NIP.</span>
                  <input
                    value={sig.nip}
                    onChange={(e) => onSignatureChange?.(idx, 'nip', e.target.value)}
                    className="bg-transparent outline-none hover:bg-gray-50 focus:bg-gray-100 rounded w-full"
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
