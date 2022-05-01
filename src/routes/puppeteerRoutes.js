import { Router } from 'express';

import * as puppeteerController from '../controllers/puppeteer';

const router = Router();

/**
 * POST /api/puppeteer.
 */
router.post('/', puppeteerController.fromTwitter);

export default router;