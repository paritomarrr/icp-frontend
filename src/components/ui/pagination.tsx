import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        className="px-3 py-1 rounded border text-slate-600 disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {pageNumbers.map((num) => (
        <button
          key={num}
          className={`px-3 py-1 rounded border ${num === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 border-slate-300'} transition-colors`}
          onClick={() => onPageChange(num)}
          disabled={num === currentPage}
        >
          {num}
        </button>
      ))}
      <button
        className="px-3 py-1 rounded border text-slate-600 disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
