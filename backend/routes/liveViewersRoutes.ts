import { Router } from 'express';
import type { Request, Response } from 'express';
import liveViewersService from '../services/liveViewersService';

const router = Router();

/**
 * GET /api/live-viewers/:salonId
 * Get current live viewer count for a salon
 */
router.get('/:salonId', (req: Request, res: Response) => {
  try {
    const { salonId } = req.params;
    const count = liveViewersService.getViewerCount(salonId);
    
    res.json({ salonId, count });
  } catch (error) {
    console.error('Error getting viewer count:', error);
    res.status(500).json({ error: 'Failed to get viewer count' });
  }
});

/**
 * GET /api/live-viewers
 * Get all viewer counts (for debugging/admin)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const counts = liveViewersService.getAllViewerCounts();
    res.json(counts);
  } catch (error) {
    console.error('Error getting all viewer counts:', error);
    res.status(500).json({ error: 'Failed to get viewer counts' });
  }
});

export default router;
