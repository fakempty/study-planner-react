import './Pagination.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  disabled?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  disabled = false,
  onPrevPage,
  onNextPage,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <nav className="pagination" aria-label="Пагінація завдань">
      <p className="pagination__info">
        Сторінка {currentPage} з {safeTotalPages} (усього у каталозі: {totalItems})
      </p>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          disabled={disabled || currentPage <= 1}
          onClick={onPrevPage}
        >
          Попередня
        </button>

        <button
          type="button"
          className="pagination__btn"
          disabled={disabled || currentPage >= safeTotalPages}
          onClick={onNextPage}
        >
          Наступна
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
