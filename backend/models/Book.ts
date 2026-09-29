import mongoose, { Schema, Document } from 'mongoose';

export type BookStatus = 'Available' | 'Issued';

export interface IBook extends Document {
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  borrowerName?: string;
  issuedDate?: Date;
  dueDate?: Date;
  description?: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    status: {
      type: String,
      enum: ['Available', 'Issued'],
      default: 'Available',
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    publisher: {
      type: String,
      trim: true,
      default: '',
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Year must be greater than 1000'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },
    borrowerName: {
      type: String,
      trim: true,
      default: '',
    },
    issuedDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching on title, author, and category
BookSchema.index({ title: 'text', author: 'text', category: 'text' });

export const BookModel = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);
export default BookModel;
