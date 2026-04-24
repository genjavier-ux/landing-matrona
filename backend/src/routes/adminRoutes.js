import { Router } from 'express';
import {
  approveTestimonial,
  createAdminTestimonial,
  createGalleryItem,
  createService,
  deleteGalleryItem,
  deleteService,
  deleteTestimonial,
  generateReviewCode,
  getAppointments,
  getDashboard,
  getWeeklyAvailability,
  updateAppointmentStatus,
  updateAdminTestimonial,
  updateGalleryItem,
  updateSection,
  updateService,
  updateTestimonialVisibility,
  upsertWeeklyAvailability
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/dashboard', getDashboard);
router.get('/availability', getWeeklyAvailability);
router.get('/appointments', getAppointments);
router.put('/availability', upsertWeeklyAvailability);
router.put('/sections/:key', updateSection);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);
router.post('/gallery', createGalleryItem);
router.put('/gallery/:id', updateGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);
router.post('/testimonials', createAdminTestimonial);
router.put('/testimonials/:id', updateAdminTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);
router.patch('/testimonials/:id/approve', approveTestimonial);
router.patch('/testimonials/:id/visibility', updateTestimonialVisibility);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.post('/review-codes', generateReviewCode);

export default router;
