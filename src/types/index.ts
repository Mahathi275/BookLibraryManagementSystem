export type BookStatus = 'Available' | 'Issued';

export interface Book {
  _id: string;
  id?: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  borrowerName?: string;
  issuedDate?: string | null;
  dueDate?: string | null;
  description?: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'librarian' | 'member';
  createdAt?: string;
}

export interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  categoriesCount: number;
  categories: string[];
  totalUsers?: number;
}

export interface DbStatusInfo {
  isConnected: boolean;
  type: 'mongodb_atlas' | 'local_store';
  uriConfigured: boolean;
  readyState: number;
  message: string;
  databaseName?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  source?: 'mongodb' | 'local_store';
  error?: string;
}
