import { Router } from 'express';

import * as posting from '../controllers/posting';

const router = Router();

/**
 * POST /api/puppeteer.
 */
router.post('/fromTwitter', posting.fromTwitter);

export default router;