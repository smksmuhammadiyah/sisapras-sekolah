import React from 'react';

interface Column {
  header: string;
  accessor: string;
  width?: string;
  render?: (row: any) => React.ReactNode;
}

interface ReportTableProps {
  columns: Column[];
  data: any[];
}

export function ReportTable({ columns, data }: ReportTableProps) {
  if (data.length === 0) {
    return <div className="text-center py-10 text-gray-500 italic border border-black border-dashed">Tidak ada data untuk ditampilkan.</div>;
  }

  return (
    <table className="w-full border-collapse border border-black text-[11px] table-fixed">
      <thead className="table-header-group">
        <tr className="bg-gray-100 print:bg-gray-200 break-inside-avoid">
          <th className="border border-black p-1 text-center w-[5%]">No</th>
          {columns.map((col, idx) => (
            <th key={idx} className="border border-black p-1 font-bold text-center uppercase break-inside-avoid" style={{ width: col.width }}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rIdx) => (
          <tr key={rIdx} className="break-inside-avoid hover:bg-gray-50">
            <td className="border border-black p-1 text-center">{rIdx + 1}</td>
            {columns.map((col, cIdx) => (
              <td key={cIdx} className="border border-black p-1 break-words">
                {col.render ? col.render(row) : (row[col.accessor] !== undefined ? row[col.accessor] : "-")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

