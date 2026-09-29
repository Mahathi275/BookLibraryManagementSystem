import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BookModel } from '../models/Book.js';
import { localStore } from '../config/db.js';

const isMongoActive = () => mongoose.connection.readyState === 1;

/**
 * GET /api/books
 * Retrieves list of books with optional search, status, and category filters
 */
export async function getBooks(req: Request, res: Response) {
  try {
    const search = (req.query.search as string) || (req.query.q as string) || '';
    const status = (req.query.status as string) || 'All';
    const category = (req.query.category as string) || 'All';

    if (isMongoActive()) {
      const filter: any = {};

      if (status && status !== 'All') {
        filter.status = status;
      }

      if (category && category !== 'All') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }

      if (search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { title: regex },
          { author: regex },
          { category: regex },
          { isbn: regex },
        ];
      }

      const books = await BookModel.find(filter).sort({ createdAt: -1 }).lean();
      return res.json({
        success: true,
        count: books.length,
        source: 'mongodb',
        data: books,
      });
    } else {
      const books = localStore.getBooks({ search, status, category });
      return res.json({
        success: true,
        count: books.length,
        source: 'local_store',
        data: books,
      });
    }
  } catch (error: any) {
    console.error('Error fetching books:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve book records',
      error: error.message,
    });
  }
}

/**
 * GET /api/books/:id
 * Retrieves single book details
 */
export async function getBookById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
      }
      const book = await BookModel.findById(id).lean();
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      return res.json({ success: true, data: book });
    } else {
      const book = localStore.getBookById(id);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      return res.json({ success: true, data: book });
    }
  } catch (error: any) {
    console.error('Error finding book by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve book',
      error: error.message,
    });
  }
}

/**
 * POST /api/books
 * Adds a new book record
 */
export async function createBook(req: Request, res: Response) {
  try {
    const {
      title,
      author,
      category,
      status = 'Available',
      isbn,
      publisher,
      publishedYear,
      borrowerName,
      description,
      coverImage,
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Book title is required' });
    }
    if (!author || !author.trim()) {
      return res.status(400).json({ success: false, message: 'Author name is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const bookPayload = {
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      status: status === 'Issued' ? 'Issued' : 'Available',
      isbn: isbn ? isbn.trim() : '',
      publisher: publisher ? publisher.trim() : '',
      publishedYear: publishedYear ? Number(publishedYear) : undefined,
      borrowerName: status === 'Issued' ? (borrowerName ? borrowerName.trim() : 'Library Patron') : '',
      issuedDate: status === 'Issued' ? new Date() : null,
      description: description ? description.trim() : '',
      coverImage: coverImage ? coverImage.trim() : '',
    };

    if (isMongoActive()) {
      const newBook = await BookModel.create(bookPayload);
      return res.status(201).json({
        success: true,
        message: 'Book created successfully in MongoDB',
        data: newBook,
      });
    } else {
      const newBook = localStore.createBook(bookPayload);
      return res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: newBook,
      });
    }
  } catch (error: any) {
    console.error('Error creating book:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add book record',
      error: error.message,
    });
  }
}

/**
 * PUT /api/books/:id
 * Updates an existing book record
 */
export async function updateBook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      category,
      status,
      isbn,
      publisher,
      publishedYear,
      borrowerName,
      description,
      coverImage,
    } = req.body;

    if (!title?.trim() || !author?.trim() || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and category are required',
      });
    }

    const updates: any = {
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: isbn ? isbn.trim() : '',
      publisher: publisher ? publisher.trim() : '',
      publishedYear: publishedYear ? Number(publishedYear) : undefined,
      description: description ? description.trim() : '',
      coverImage: coverImage !== undefined ? coverImage : '',
    };

    if (status) {
      updates.status = status;
      if (status === 'Issued') {
        updates.borrowerName = borrowerName?.trim() || 'Library Patron';
        updates.issuedDate = updates.issuedDate || new Date();
      } else {
        updates.borrowerName = '';
        updates.issuedDate = null;
        updates.dueDate = null;
      }
    }

    if (isMongoActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid Book ID' });
      }
      const updated = await BookModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Book record not found' });
      }
      return res.json({
        success: true,
        message: 'Book updated successfully in MongoDB',
        data: updated,
      });
    } else {
      const updated = localStore.updateBook(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Book record not found' });
      }
      return res.json({
        success: true,
        message: 'Book updated successfully',
        data: updated,
      });
    }
  } catch (error: any) {
    console.error('Error updating book:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update book record',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/books/:id
 * Removes a book record
 */
export async function deleteBook(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid Book ID' });
      }
      const deleted = await BookModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Book record not found' });
      }
      return res.json({
        success: true,
        message: `Book "${deleted.title}" deleted successfully from MongoDB`,
      });
    } else {
      const deleted = localStore.deleteBook(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Book record not found' });
      }
      return res.json({
        success: true,
        message: 'Book deleted successfully',
      });
    }
  } catch (error: any) {
    console.error('Error deleting book:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete book record',
      error: error.message,
    });
  }
}

/**
 * PATCH /api/books/:id/status
 * Quick-toggle book status between Available and Issued
 */
export async function toggleBookStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, borrowerName } = req.body;

    if (!status || !['Available', 'Issued'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Available" or "Issued"',
      });
    }

    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'Issued') {
      updates.borrowerName = borrowerName?.trim() || 'Library Member';
      updates.issuedDate = new Date();
      // default 30 days due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      updates.dueDate = dueDate;
    } else {
      updates.borrowerName = '';
      updates.issuedDate = null;
      updates.dueDate = null;
    }

    if (isMongoActive()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid Book ID' });
      }
      const updated = await BookModel.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      return res.json({
        success: true,
        message: `Book marked as ${status}`,
        data: updated,
      });
    } else {
      const updated = localStore.updateBook(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      return res.json({
        success: true,
        message: `Book marked as ${status}`,
        data: updated,
      });
    }
  } catch (error: any) {
    console.error('Error toggling book status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update book status',
      error: error.message,
    });
  }
}

/**
 * GET /api/books/stats/overview
 * Returns library metric counts
 */
export async function getBookStats(req: Request, res: Response) {
  try {
    if (isMongoActive()) {
      const [totalBooks, availableBooks, issuedBooks, categoriesList] = await Promise.all([
        BookModel.countDocuments(),
        BookModel.countDocuments({ status: 'Available' }),
        BookModel.countDocuments({ status: 'Issued' }),
        BookModel.distinct('category'),
      ]);

      return res.json({
        success: true,
        data: {
          totalBooks,
          availableBooks,
          issuedBooks,
          categoriesCount: categoriesList.length,
          categories: categoriesList,
        },
      });
    } else {
      const stats = localStore.getStats();
      return res.json({
        success: true,
        data: stats,
      });
    }
  } catch (error: any) {
    console.error('Error calculating book statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve book statistics',
      error: error.message,
    });
  }
}
