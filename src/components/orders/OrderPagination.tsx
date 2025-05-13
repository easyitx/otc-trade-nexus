
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const OrderPagination: React.FC<OrderPaginationProps> = ({
                                                                  currentPage,
                                                                  totalPages,
                                                                  onPageChange
                                                                }) => {
  const { theme } = useTheme();

  // Generate pagination items
  const renderPaginationItems = () => {
    if (!totalPages) return null;

    const items = [];

    // Always show first page, current page, and last page
    // Plus one page before and after current if they exist
    const pagesToShow = new Set([
      1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages
    ].filter(p => p >= 1 && p <= totalPages));

    const pagesArray = Array.from(pagesToShow).sort((a, b) => a - b);

    // Add pagination items with ellipsis where needed
    let prevPage = 0;
    for (const page of pagesArray) {
      if (page - prevPage > 1) {
        // Add ellipsis
        items.push(
            <PaginationItem key={`ellipsis-${prevPage}`}>
              <span className="flex h-9 w-9 items-center justify-center">...</span>
            </PaginationItem>
        );
      }

      items.push(
          <PaginationItem key={page}>
            <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                className={cn(
                    "cursor-pointer",
                    page === currentPage && "bg-purple-500 text-white hover:bg-purple-600"
                )}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
      );

      prevPage = page;
    }

    return items;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
      <div className={cn(
          "p-4 border-t",
          theme === "light" ? "border-border" : "border-otc-active"
      )}>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={cn(
                      "cursor-pointer",
                      currentPage === 1 && "opacity-50 cursor-not-allowed"
                  )}
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  className={cn(
                      "cursor-pointer",
                      currentPage === totalPages && "opacity-50 cursor-not-allowed"
                  )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
  );
};