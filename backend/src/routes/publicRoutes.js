import { Router } from 'express';
import {
  createContact,
  createSubscription,
  createTestimonial,
  getPublicContent
} from '../controllers/publicController.js';

const router = Router();

router.get('/content', getPublicContent);
router.post('/contact', createContact);
router.post('/subscribe', createSubscription);
router.post('/testimonials', createTestimonial);

export default router;
