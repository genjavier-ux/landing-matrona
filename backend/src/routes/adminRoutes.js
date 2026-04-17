import { Router } from 'express';
import {
  createService,
  getDashboard,
  approveTestimonial,
  deleteService,
  deleteTestimonial,
  generateReviewCode,
  updateSection,
  updateService
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/dashboard', getDashboard);
router.put('/sections/:key', updateSection);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);
router.delete('/testimonials/:id', deleteTestimonial);
router.patch('/testimonials/:id/approve', approveTestimonial);
router.post('/review-codes', generateReviewCode);

export default router;
