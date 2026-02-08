
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
  totalItems?: number;
  showItemsPerPage?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  showItemsPerPage = true,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 order-2 sm:order-1 w-full sm:w-auto justify-between sm:justify-start">
        {totalItems !== undefined && (
          <span className="hidden sm:inline-block">
            {totalItems} data ditemukan
          </span>
        )}

        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Baris per halaman</span>
            <Select
              value={itemsPerPage?.toString()}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 order-1 sm:order-2">
        <div className="flex w-[100px] items-center justify-center text-xs font-medium text-slate-500">
          Hal {currentPage} dari {totalPages}
        </div>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
