/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { BookCard } from './components/BookCard';
import { BookTable } from './components/BookTable';
import { BookModal } from './components/BookModal';
import { IssueModal } from './components/IssueModal';
import { AuthModal } from './components/AuthModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { ApiDocsModal } from './components/ApiDocsModal';
import { PatronsList } from './components/PatronsList';

import { Book, User, LibraryStats, DbStatusInfo } from './types';
import { api } from './services/api';

import {
  BookOpen,
  Plus,
  RefreshCw,
  Library,
  BookMarked,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'catalog' | 'circulation' | 'patrons'>('catalog');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Books & Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    categoriesCount: 0,
    categories: [],
  });
  const [users, setUsers] = useState<User[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Issued'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Loading & Error State
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [bookToIssue, setBookToIssue] = useState<Book | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);

  // Delete Confirmation State
  const [bookToDelete, setBookToDelete] = useState<{ id: string; title: string } | null>(null);

  // Show toast notification
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [booksRes, statsRes, dbRes, usersRes] = await Promise.all([
        api.getBooks(),
        api.getStats().catch(() => null),
        api.getDbStatus().catch(() => null),
        api.getUsers().catch(() => null),
      ]);

      if (booksRes.data) {
        setBooks(booksRes.data);
      }

      if (statsRes?.data) {
        setStats(statsRes.data);
      } else if (booksRes.data) {
        // Fallback stats computation
        const total = booksRes.data.length;
        const avail = booksRes.data.filter((b) => b.status === 'Available').length;
        const iss = booksRes.data.filter((b) => b.status === 'Issued').length;
        const cats = Array.from(new Set(booksRes.data.map((b) => b.category)));
        setStats({
          totalBooks: total,
          availableBooks: avail,
          issuedBooks: iss,
          categoriesCount: cats.length,
          categories: cats,
        });
      }

      if (dbRes?.data) {
        setDbStatus(dbRes.data);
      }

      if (usersRes?.data) {
        setUsers(usersRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load library catalog:', err);
      showToast('Could not load library data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Restore authenticated user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('library_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('library_user');
      }
    }
    loadData();
  }, []);

  // Filtered books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Circulation tab specifically highlights Issued books unless overridden
    if (activeTab === 'circulation') {
      result = result.filter((b) => b.status === 'Issued');
    } else if (statusFilter !== 'All') {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter((b) => b.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.isbn && b.isbn.toLowerCase().includes(q)) ||
          (b.borrowerName && b.borrowerName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [books, activeTab, statusFilter, categoryFilter, searchTerm]);

  // Handlers for Book operations
  const handleOpenAddBook = () => {
    setBookToEdit(null);
    setIsBookModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setBookToEdit(book);
    setIsBookModalOpen(true);
  };

  const handleSaveBook = async (bookData: Partial<Book>) => {
    if (bookToEdit) {
      const bookId = bookToEdit._id || bookToEdit.id || '';
      const response = await api.updateBook(bookId, bookData);
      if (response.data) {
        showToast(`Updated "${response.data.title}" successfully.`);
      }
    } else {
      const response = await api.createBook(bookData);
      if (response.data) {
        showToast(`Cataloged "${response.data.title}" successfully.`);
      }
    }
    await loadData();
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await api.deleteBook(bookToDelete.id);
      showToast(`Removed "${bookToDelete.title}" from catalog.`);
      setBookToDelete(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete book record', 'error');
    }
  };

  const handleOpenIssue = (book: Book) => {
    setBookToIssue(book);
    setIsIssueModalOpen(true);
  };

  const handleConfirmIssue = async (bookId: string, borrowerName: string) => {
    try {
      const response = await api.toggleBookStatus(bookId, 'Issued', borrowerName);
      if (response.data) {
        showToast(`Issued "${response.data.title}" to ${borrowerName}`);
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to issue book', 'error');
      throw err;
    }
  };

  const handleReturnBook = async (bookId: string) => {
    try {
      const response = await api.toggleBookStatus(bookId, 'Available');
      if (response.data) {
        showToast(`Returned "${response.data.title}" to available shelf inventory`);
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to return book', 'error');
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('library_auth_token');
    localStorage.removeItem('library_user');
    setCurrentUser(null);
    showToast('Signed out of library management system.');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Bar Navigation */}
      <Navbar
        user={currentUser}
        dbStatus={dbStatus}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddBook={handleOpenAddBook}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenDbStatus={() => setIsDbModalOpen(true)}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner Section */}
        <section className="relative rounded-2xl overflow-hidden mb-8 border border-neutral-800 bg-neutral-900">
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/hero_library_archive_1790701226275.jpg"
              alt="Library interior archive"
              className="w-full h-full object-cover opacity-25"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Full-Stack Architecture · React · Express · MongoDB · Mongoose</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 mb-2 leading-tight">
              Library Catalog & Circulation
            </h1>
            <p className="text-sm text-neutral-300 mb-5 leading-relaxed">
              Curate bibliographic records, manage real-time availability loans, and register patron checkouts through Express REST APIs backed by Mongoose schemas.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenAddBook}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Catalog New Book</span>
              </button>

              <button
                onClick={() => setIsDbModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {dbStatus?.type === 'mongodb_atlas' ? 'MongoDB Atlas Active' : 'Configure MongoDB Atlas'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Global Statistics Overview */}
        <StatsOverview
          stats={stats}
          selectedStatus={statusFilter}
          onFilterStatus={(st) => {
            if (activeTab !== 'catalog') setActiveTab('catalog');
            setStatusFilter(st);
          }}
        />

        {/* Main Content Area based on Active Tab */}
        {activeTab === 'patrons' ? (
          <PatronsList
            users={users}
            books={books}
            onOpenIssueToUser={(u) => {
              setActiveTab('catalog');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : (
          <div>
            {/* Filter and Search Bar */}
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={activeTab === 'circulation' ? 'Issued' : statusFilter}
              onStatusChange={(status) => {
                if (activeTab === 'circulation') setActiveTab('catalog');
                setStatusFilter(status);
              }}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              categories={stats.categories || []}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFiltered={filteredBooks.length}
            />

            {/* Tab Context Subtitle */}
            {activeTab === 'circulation' && (
              <div className="mb-4 flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>
                  Circulation Desk: Showing all <strong className="text-amber-400 font-mono">{filteredBooks.length}</strong> active book loans.
                </span>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View entire catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Loading Skeleton / Books Display */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mb-2" />
                <p className="text-xs">Loading library inventory...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-neutral-900/40">
                <Library className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                <h3 className="font-serif text-base font-semibold text-neutral-200 mb-1">
                  No matching books found
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                  {searchTerm || categoryFilter !== 'All' || statusFilter !== 'All'
                    ? 'Try adjusting your search criteria or clearing filters to see more results.'
                    : 'Your catalog collection is currently empty.'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('All');
                        setStatusFilter('All');
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={handleOpenAddBook}
                    className="px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Add First Book
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book._id || book.id}
                    book={book}
                    onEdit={handleEditBook}
                    onDelete={(id, title) => setBookToDelete({ id, title })}
                    onOpenIssue={handleOpenIssue}
                    onReturnBook={handleReturnBook}
                  />
                ))}
              </div>
            ) : (
              <BookTable
                books={filteredBooks}
                onEdit={handleEditBook}
                onDelete={(id, title) => setBookToDelete({ id, title })}
                onOpenIssue={handleOpenIssue}
                onReturnBook={handleReturnBook}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/60 py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500/70" />
            <span className="text-neutral-400 font-medium">Athenaeum Library System</span>
            <span>·</span>
            <span>REST API & Mongoose Full-Stack</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setIsApiDocsOpen(true)}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              API Reference
            </button>
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              MongoDB Atlas
            </button>
            <span>·</span>
            <span className="font-mono text-[11px] text-neutral-500">
              {books.length} Books Registered
            </span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl border text-xs font-medium shadow-xl flex items-center gap-2 animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-neutral-900 border-emerald-500/40 text-emerald-300'
              : 'bg-neutral-900 border-rose-500/40 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modals */}
      <BookModal
        isOpen={isBookModalOpen}
        bookToEdit={bookToEdit}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookToEdit(null);
        }}
        onSubmit={handleSaveBook}
        categories={stats.categories}
      />

      <IssueModal
        isOpen={isIssueModalOpen}
        book={bookToIssue}
        onClose={() => {
          setIsIssueModalOpen(false);
          setBookToIssue(null);
        }}
        onConfirmIssue={handleConfirmIssue}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        dbStatus={dbStatus}
        onClose={() => setIsDbModalOpen(false)}
        onStatusUpdated={(status) => {
          setDbStatus(status);
          loadData();
        }}
      />

      <ApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl text-xs">
            <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Book Deletion</span>
            </div>
            <p className="text-neutral-300 mb-4 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="text-neutral-100">"{bookToDelete.title}"</strong> from the library catalog?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setBookToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBook}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
