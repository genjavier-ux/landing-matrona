import { useEffect, useState } from 'react';
import { fetchPublicContent } from '../services/api';
import {
  AboutSection,
  fallbackContent,
  HomeHeader,
  HomeHero,
  HomeSkeleton,
  mockServices,
  mockTestimonials,
  navItems,
  PlaceholderSections,
  placeholderSections,
  ServiceGalleryModal,
  ServicesSection,
  servicesPerPage,
  TestimonialsSection
} from '../components/home';
import { NoticeBanner } from '../components/ui';

export default function HomePage() {
  const [content, setContent] = useState(fallbackContent);
  const [activeSection, setActiveSection] = useState('inicio');
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [galleryState, setGalleryState] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchPublicContent()
      .then((response) => {
        if (cancelled) return;

        setContent({
          ...fallbackContent,
          ...response,
          hero: {
            ...fallbackContent.hero,
            ...response?.hero
          }
        });
      })
      .catch(() => {
        if (!cancelled) {
          setNotice('No se pudo cargar el contenido online, pero deje el home listo para seguir disenando.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section-id]');

    if (!sections.length || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('visible');
          setActiveSection(entry.target.dataset.sectionId || 'inicio');
        });
      },
      {
        threshold: 0.55,
        rootMargin: '-16% 0px -28% 0px'
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isLoading]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % mockTestimonials.length);
    }, 3400);

    return () => clearInterval(timer);
  }, []);

  const services = mockServices;
  const safeActiveServiceIndex = Math.min(activeServiceIndex, Math.max(services.length - 1, 0));
  const activeService = services[safeActiveServiceIndex];
  const activeServicePage = Math.floor(safeActiveServiceIndex / servicesPerPage);
  const totalServicePages = Math.ceil(services.length / servicesPerPage);
  const servicePageStart = activeServicePage * servicesPerPage;
  const visibleServices = services.slice(servicePageStart, servicePageStart + servicesPerPage);
  const openGalleryService = galleryState ? services[galleryState.serviceIndex] : null;
  const activeGalleryImage = openGalleryService?.gallery?.[galleryState?.slideIndex || 0];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const getCardOffset = (index) => {
    const total = mockTestimonials.length;
    let offset = index - activeTestimonial;

    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    return offset;
  };

  const handleServicePageChange = (direction) => {
    const nextPage = (activeServicePage + direction + totalServicePages) % totalServicePages;
    setActiveServiceIndex(nextPage * servicesPerPage);
  };

  const openServiceGallery = (serviceIndex, slideIndex = 0) => {
    if (!services[serviceIndex]?.gallery?.length) return;

    setGalleryState({
      serviceIndex,
      slideIndex
    });
  };

  const closeServiceGallery = () => {
    setGalleryState(null);
  };

  const moveGallery = (direction) => {
    if (!openGalleryService?.gallery?.length) return;

    setGalleryState((prev) => ({
      ...prev,
      slideIndex: (prev.slideIndex + direction + openGalleryService.gallery.length) % openGalleryService.gallery.length
    }));
  };

  const handleServiceCardClick = (serviceIndex) => {
    setActiveServiceIndex(serviceIndex);

    if (services[serviceIndex]?.gallery?.length) {
      openServiceGallery(serviceIndex, 0);
    }
  };

  useEffect(() => {
    if (activeServiceIndex >= services.length) {
      setActiveServiceIndex(0);
    }
  }, [activeServiceIndex, services.length]);

  useEffect(() => {
    if (!galleryState) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeServiceGallery();
      if (event.key === 'ArrowRight') moveGallery(1);
      if (event.key === 'ArrowLeft') moveGallery(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryState, openGalleryService]);

  if (isLoading) return <HomeSkeleton />;

  return (
    <main className="clean-home">
      <HomeHeader navItems={navItems} activeSection={activeSection} onSelect={handleNavClick} />

      <HomeHero
        content={content}
        onShowServices={() => handleNavClick('servicios')}
        onShowAbout={() => handleNavClick('sobre-mi')}
      />

      <AboutSection />

      <ServicesSection
        services={services}
        activeService={activeService}
        activeServiceIndex={safeActiveServiceIndex}
        activeServicePage={activeServicePage}
        totalServicePages={totalServicePages}
        visibleServices={visibleServices}
        servicePageStart={servicePageStart}
        onPrevPage={() => handleServicePageChange(-1)}
        onNextPage={() => handleServicePageChange(1)}
        onSelectPage={(pageIndex) => setActiveServiceIndex(pageIndex * servicesPerPage)}
        onSelectService={handleServiceCardClick}
        onOpenGallery={() => openServiceGallery(safeActiveServiceIndex, 0)}
      />

      <ServiceGalleryModal
        openGalleryService={openGalleryService}
        galleryState={galleryState}
        activeGalleryImage={activeGalleryImage}
        onClose={closeServiceGallery}
        onPrev={() => moveGallery(-1)}
        onNext={() => moveGallery(1)}
        onSelectImage={(index) => setGalleryState((prev) => ({ ...prev, slideIndex: index }))}
      />

      <TestimonialsSection
        testimonials={mockTestimonials}
        activeTestimonial={activeTestimonial}
        getCardOffset={getCardOffset}
        onSelect={setActiveTestimonial}
      />

      <PlaceholderSections sections={placeholderSections} />

      {notice ? <NoticeBanner className="clean-notice">{notice}</NoticeBanner> : null}
    </main>
  );
}
