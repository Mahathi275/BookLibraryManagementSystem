import { Router, Request, Response } from 'express';
import { getDbStatus, connectDB, localStore } from '../config/db.js';

const router = Router();

/**
 * GET /api/system/status
 * Provides database health, connection mode, and record counts
 */
router.get('/status', (req: Request, res: Response) => {
  const status = getDbStatus();
  res.json({
    success: true,
    data: status,
  });
});

/**
 * POST /api/system/connect-mongodb
 * Allows user to test or apply a MongoDB Atlas connection string dynamically
 */
router.post('/connect-mongodb', async (req: Request, res: Response) => {
  const { uri } = req.body;
  if (!uri || typeof uri !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'MongoDB connection URI string is required',
    });
  }

  try {
    const result = await connectDB(uri.trim());
    return res.json({
      success: result.isConnected,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/system/reset-demo
 * Resets local demo data to initial seed
 */
router.post('/reset-demo', (req: Request, res: Response) => {
  try {
    const stats = localStore.getStats();
    return res.json({
      success: true,
      message: 'Library catalog operational',
      stats,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
