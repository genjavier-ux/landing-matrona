import { Router } from 'express';
import {
  approveTestimonial,
  deleteTestimonial,
  generateReviewCode,
  updateService
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.put('/services/:id', updateService);
router.delete('/testimonials/:id', deleteTestimonial);
router.patch('/testimonials/:id/approve', approveTestimonial);
router.post('/review-codes', generateReviewCode);

export default router;
