import { Router } from 'express';
import {
  createAppointment,
  createContact,
  createSubscription,
  createTestimonial,
  getPublicAvailability,
  getPublicContent
} from '../controllers/publicController.js';

const router = Router();

router.get('/content', getPublicContent);
router.get('/availability', getPublicAvailability);
router.post('/contact', createContact);
router.post('/appointments', createAppointment);
router.post('/subscribe', createSubscription);
router.post('/testimonials', createTestimonial);

export default router;
