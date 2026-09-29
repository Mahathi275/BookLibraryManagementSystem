import { ApiResponse, Book, BookStatus, DbStatusInfo, LibraryStats, User } from '../types';

// Use environment variable VITE_API_URL if configured, otherwise fallback to relative '/api'
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject token if stored
  const token = localStorage.getItem('library_auth_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: `Failed to parse response from ${endpoint} (Status ${response.status})`,
    }));

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (err: any) {
    console.error(`API request failed [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Books CRUD
  async getBooks(params?: { search?: string; status?: string; category?: string }): Promise<ApiResponse<Book[]>> {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.set('search', params.search.trim());
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.category && params.category !== 'All') query.set('category', params.category);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<ApiResponse<Book[]>>(`/books${queryString}`);
  },

  async getBookById(id: string): Promise<ApiResponse<Book>> {
    return request<ApiResponse<Book>>(`/books/${encodeURIComponent(id)}`);
  },

  async createBook(book: Partial<Book>): Promise<ApiResponse<Book>> {
    return request<ApiResponse<Book>>('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  },

  async updateBook(id: string, updates: Partial<Book>): Promise<ApiResponse<Book>> {
    return request<ApiResponse<Book>>(`/books/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteBook(id: string): Promise<ApiResponse<{ message: string }>> {
    return request<ApiResponse<{ message: string }>>(`/books/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async toggleBookStatus(id: string, status: BookStatus, borrowerName?: string): Promise<ApiResponse<Book>> {
    return request<ApiResponse<Book>>(`/books/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, borrowerName }),
    });
  },

  async getStats(): Promise<ApiResponse<LibraryStats>> {
    return request<ApiResponse<LibraryStats>>('/books/stats/overview');
  },

  // Authentication
  async signup(payload: { name: string; email: string; password: string; role?: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return request<ApiResponse<{ user: User; token: string }>>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return request<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getUsers(): Promise<ApiResponse<User[]>> {
    return request<ApiResponse<User[]>>('/auth/users');
  },

  // System & Database
  async getDbStatus(): Promise<ApiResponse<DbStatusInfo>> {
    return request<ApiResponse<DbStatusInfo>>('/system/status');
  },

  async connectMongoAtlas(uri: string): Promise<ApiResponse<DbStatusInfo>> {
    return request<ApiResponse<DbStatusInfo>>('/system/connect-mongodb', {
      method: 'POST',
      body: JSON.stringify({ uri }),
    });
  },
};
