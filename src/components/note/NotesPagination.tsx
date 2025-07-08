import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SearchParams {
  query?: string;
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
  subject?: string;
  page?: string;
}

export function NotesPagination({
  totalPages,
  currentPage,
  searchParams,
}: {
  totalPages: number;
  currentPage: number;
  searchParams: SearchParams;
}) {
  // Helper function to build URL with updated page
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();

    // Add all current search params except page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value) {
        params.set(key, value);
      }
    });

    // Add the new page
    if (page > 1) {
      params.set("page", page.toString());
    }

    const queryString = params.toString();
    return `/notes${queryString ? `?${queryString}` : ""}`;
  };

  // Calculate which pages to show
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <Pagination className="mt-10 flex justify-center">
      <PaginationContent>
        {hasPrevious && (
          <PaginationItem>
            <PaginationPrevious href={buildPageUrl(currentPage - 1)} />
          </PaginationItem>
        )}

        {visiblePages.map((page, index) => (
          <PaginationItem key={index}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={buildPageUrl(page)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {hasNext && (
          <PaginationItem>
            <PaginationNext href={buildPageUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
