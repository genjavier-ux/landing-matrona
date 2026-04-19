import { Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import CommentsPage from './pages/CommentsPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sobre-mi" element={<AboutPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/comentarios" element={<CommentsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/reservar-hora" element={<BookingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
