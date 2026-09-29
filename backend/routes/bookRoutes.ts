import { Router } from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  toggleBookStatus,
  getBookStats,
} from '../controllers/bookController.js';

const router = Router();

// Stats overview
router.get('/stats/overview', getBookStats);

// Main book endpoints
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.patch('/:id/status', toggleBookStatus);

export default router;
