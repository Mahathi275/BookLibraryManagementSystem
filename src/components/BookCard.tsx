import React from 'react';
import { Book as BookType } from '../types';
import { BookOpen, Edit2, Trash2, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookCardProps {
  book: BookType;
  onEdit: (book: BookType) => void;
  onDelete: (id: string, title: string) => void;
  onOpenIssue: (book: BookType) => void;
  onReturnBook: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onEdit,
  onDelete,
  onOpenIssue,
  onReturnBook,
}) => {
  const isAvailable = book.status === 'Available';
  const bookId = book._id || book.id || '';

  return (
    <div className="group relative flex flex-col justify-between bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 transition-all duration-200">
      <div>
        {/* Book Cover / Fallback Spine Header */}
        <div className="relative w-full h-44 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 mb-3 flex items-center justify-center">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Zero-broken-image fallback
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}

          {/* Fallback architectural graphic when no image or image fails to load */}
          <div className="absolute inset-0 flex flex-col justify-between p-3.5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 pointer-events-none -z-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase">
                {book.category}
              </span>
              <BookOpen className="w-4 h-4 text-amber-500/50" />
            </div>
            <div>
              <p className="font-serif text-sm font-semibold text-neutral-200 line-clamp-2">
                {book.title}
              </p>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                {book.author}
              </p>
            </div>
            <div className="text-[10px] text-neutral-600 font-mono">
              {book.isbn || 'CATALOGED RECORD'}
            </div>
          </div>
        </div>

        {/* Clean Unboxed Metadata with Typographic Separators */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1.5">
          <span className="text-amber-300/80 font-medium">{book.category}</span>
          {book.publishedYear && (
            <>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="font-mono tabular-nums">{book.publishedYear}</span>
            </>
          )}
          {book.publisher && (
            <>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="truncate max-w-[120px]">{book.publisher}</span>
            </>
          )}
        </div>

        {/* Primary Title and Author */}
        <h3 className="font-serif text-base font-semibold text-neutral-100 group-hover:text-amber-200 transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-neutral-300 mb-2.5 font-medium line-clamp-1">
          by {book.author}
        </p>

        {/* Description snippet if available */}
        {book.description && (
          <p className="text-xs text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
            {book.description}
          </p>
        )}

        {/* Status indicator line - NO pill badges, clean unboxed indicator with icon and text */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs mb-3">
          {isAvailable ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Available for loan</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400 font-medium truncate">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {book.borrowerName ? `Issued: ${book.borrowerName}` : 'Issued on loan'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800 gap-2">
        {/* Toggle Status Button */}
        {isAvailable ? (
          <button
            onClick={() => onOpenIssue(book)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <span>Issue Book</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={() => onReturnBook(bookId)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <span>Mark Returned</span>
          </button>
        )}

        {/* Edit and Delete Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(book)}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Edit book details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(bookId, book.title)}
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Delete book record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
