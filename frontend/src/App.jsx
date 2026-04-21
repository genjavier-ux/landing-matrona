import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CommentsPage = lazy(() => import('./pages/CommentsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

const renderLazyPage = (PageComponent) => (
  <Suspense fallback={<p className="status-note section-shell">Cargando pagina...</p>}>
    <PageComponent />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={renderLazyPage(HomePage)} />
        <Route path="/sobre-mi" element={renderLazyPage(AboutPage)} />
        <Route path="/servicios" element={renderLazyPage(ServicesPage)} />
        <Route path="/comentarios" element={renderLazyPage(CommentsPage)} />
        <Route path="/contacto" element={renderLazyPage(ContactPage)} />
        <Route path="/reservar-hora" element={renderLazyPage(BookingPage)} />
        <Route path="/login" element={renderLazyPage(LoginPage)} />
        <Route path="/admin" element={renderLazyPage(AdminPage)} />
      </Route>
    </Routes>
  );
}
