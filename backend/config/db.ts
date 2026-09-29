import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { BookModel } from '../models/Book.js';
import { UserModel } from '../models/User.js';

export interface DbStatus {
  isConnected: boolean;
  type: 'mongodb_atlas' | 'local_store';
  uriConfigured: boolean;
  readyState: number;
  message: string;
  databaseName?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'backend', 'data');
const STORE_FILE = path.join(DATA_DIR, 'library_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed books
export const INITIAL_SEEDED_BOOKS = [
  {
    title: 'Architectural Patterns in Modern Systems',
    author: 'Martin Fowler',
    category: 'Architecture',
    status: 'Available',
    isbn: '978-0134757599',
    publisher: 'Addison-Wesley Professional',
    publishedYear: 2023,
    description: 'A comprehensive guide to enterprise application patterns, decoupled microservices, and resilient distributed data architecture.',
    coverImage: '/src/assets/images/book_cover_architecture_1790701250913.jpg',
  },
  {
    title: 'The Master Algorithm',
    author: 'Pedro Domingos',
    category: 'Artificial Intelligence',
    status: 'Issued',
    borrowerName: 'Sarah Jenkins (ID: MEM-4091)',
    issuedDate: new Date('2026-03-12T10:30:00Z'),
    dueDate: new Date('2026-04-12T10:30:00Z'),
    isbn: '978-0465065707',
    publisher: 'Basic Books',
    publishedYear: 2021,
    description: 'How the quest for the ultimate learning machine will remake our world, unifying machine learning and statistical deduction.',
    coverImage: '/src/assets/images/book_cover_algorithms_1790701262759.jpg',
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Software Engineering',
    status: 'Available',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    publishedYear: 2020,
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
    coverImage: '',
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth',
    category: 'Databases',
    status: 'Available',
    isbn: '978-0078022159',
    publisher: 'McGraw-Hill',
    publishedYear: 2022,
    description: 'Fundamental concepts of database management, relational algebra, SQL, indexing, and NoSQL transaction guarantees.',
    coverImage: '',
  },
  {
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    category: 'Design',
    status: 'Issued',
    borrowerName: 'Alex Rivera (ID: MEM-1084)',
    issuedDate: new Date('2026-03-20T14:15:00Z'),
    dueDate: new Date('2026-04-20T14:15:00Z'),
    isbn: '978-0465050659',
    publisher: 'Basic Books',
    publishedYear: 2019,
    description: 'The definitive guide to human-centered design, cognitive ergonomics, and usable physical/digital interfaces.',
    coverImage: '',
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'Architecture',
    status: 'Available',
    isbn: '978-1449373320',
    publisher: "O'Reilly Media",
    publishedYear: 2024,
    description: 'The big ideas behind reliable, scalable, and maintainable systems for batch and stream processing.',
    coverImage: '',
  }
];

// Initial seeded admin user
export const INITIAL_SEEDED_USERS = [
  {
    name: 'Eleanor Vance',
    email: 'librarian@citylibrary.org',
    password: 'password123',
    role: 'librarian',
    createdAt: new Date('2026-01-01T00:00:00Z')
  },
  {
    name: 'David Chen',
    email: 'member@university.edu',
    password: 'password123',
    role: 'member',
    createdAt: new Date('2026-02-15T00:00:00Z')
  }
];

// In-Memory / File Persistent Store Fallback
interface StoreData {
  books: any[];
  users: any[];
}

class LocalStore {
  private data: StoreData = { books: [], users: [] };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seed();
      }
    } catch (e) {
      console.warn('Could not read store file, re-seeding local store:', e);
      this.seed();
    }
  }

  private save() {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist local store file:', e);
    }
  }

  private seed() {
    this.data.books = INITIAL_SEEDED_BOOKS.map((b, idx) => ({
      _id: `b_${Date.now()}_${idx}`,
      ...b,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    this.data.users = INITIAL_SEEDED_USERS.map((u, idx) => ({
      _id: `u_${Date.now()}_${idx}`,
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    this.save();
  }

  getBooks(query?: { search?: string; status?: string; category?: string }) {
    let list = [...this.data.books];
    if (query?.status && query.status !== 'All') {
      list = list.filter((b) => b.status === query.status);
    }
    if (query?.category && query.category !== 'All') {
      list = list.filter((b) => b.category.toLowerCase() === query.category?.toLowerCase());
    }
    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getBookById(id: string) {
    return this.data.books.find((b) => b._id === id || b.id === id) || null;
  }

  createBook(bookData: any) {
    const newBook = {
      _id: `b_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...bookData,
      status: bookData.status || 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.books.unshift(newBook);
    this.save();
    return newBook;
  }

  updateBook(id: string, updates: any) {
    const index = this.data.books.findIndex((b) => b._id === id || b.id === id);
    if (index === -1) return null;
    this.data.books[index] = {
      ...this.data.books[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.books[index];
  }

  deleteBook(id: string) {
    const index = this.data.books.findIndex((b) => b._id === id || b.id === id);
    if (index === -1) return false;
    this.data.books.splice(index, 1);
    this.save();
    return true;
  }

  getUsers() {
    return this.data.users;
  }

  findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: any) {
    const newUser = {
      _id: `u_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  getStats() {
    const total = this.data.books.length;
    const available = this.data.books.filter((b) => b.status === 'Available').length;
    const issued = this.data.books.filter((b) => b.status === 'Issued').length;
    const categories = Array.from(new Set(this.data.books.map((b) => b.category)));
    return {
      totalBooks: total,
      availableBooks: available,
      issuedBooks: issued,
      categoriesCount: categories.length,
      categories,
      totalUsers: this.data.users.length,
    };
  }
}

export const localStore = new LocalStore();

let isConnectedToMongo = false;
let currentMongoUri = process.env.MONGODB_URI || '';
let mongoDatabaseName = '';

/**
 * Connect to MongoDB Atlas or custom MongoDB instance
 */
export async function connectDB(customUri?: string): Promise<DbStatus> {
  const uriToUse = customUri || process.env.MONGODB_URI;

  if (!uriToUse || uriToUse.includes('username:password@cluster')) {
    console.log('MongoDB Atlas URI not set or placeholder. Operating in persistent local store mode.');
    isConnectedToMongo = false;
    return {
      isConnected: false,
      type: 'local_store',
      uriConfigured: false,
      readyState: 0,
      message: 'MongoDB Atlas URI not provided in .env; operating smoothly with persistent local storage.',
    };
  }

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uriToUse, {
      serverSelectionTimeoutMS: 4000,
    });

    isConnectedToMongo = true;
    currentMongoUri = uriToUse;
    mongoDatabaseName = conn.connection.name || 'library';

    console.log(`MongoDB Connected successfully to: ${conn.connection.host} / ${mongoDatabaseName}`);

    // Seed MongoDB collection if empty
    const bookCount = await BookModel.countDocuments();
    if (bookCount === 0) {
      console.log('Seeding initial library books into MongoDB...');
      await BookModel.insertMany(INITIAL_SEEDED_BOOKS);
    }

    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial library staff into MongoDB...');
      await UserModel.insertMany(INITIAL_SEEDED_USERS);
    }

    return {
      isConnected: true,
      type: 'mongodb_atlas',
      uriConfigured: true,
      readyState: mongoose.connection.readyState,
      message: `Connected to MongoDB Atlas (${conn.connection.host})`,
      databaseName: mongoDatabaseName,
    };
  } catch (error: any) {
    console.warn('MongoDB connection failed. Falling back gracefully to persistent local store:', error.message);
    isConnectedToMongo = false;
    return {
      isConnected: false,
      type: 'local_store',
      uriConfigured: true,
      readyState: 0,
      message: `MongoDB Atlas connection error: ${error.message}. Local persistent store is active.`,
    };
  }
}

export function getDbStatus(): DbStatus {
  const readyState = mongoose.connection.readyState;
  const isMongoReady = readyState === 1 && isConnectedToMongo;

  return {
    isConnected: isMongoReady,
    type: isMongoReady ? 'mongodb_atlas' : 'local_store',
    uriConfigured: Boolean(process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('username:password')),
    readyState,
    message: isMongoReady
      ? `Connected to MongoDB Atlas (${mongoDatabaseName || 'database'})`
      : 'Active on persistent storage adapter (MongoDB Atlas connection ready)',
    databaseName: isMongoReady ? mongoDatabaseName : 'local_library_db',
  };
}
