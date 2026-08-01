"use client";

import { Button } from "@/components/ui/button";

interface CustomerPaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function CustomerPagination({
  page,
  total,
  limit,
  onPageChange,
}: CustomerPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Halaman {page} dari {totalPages} ({total} customer)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}
