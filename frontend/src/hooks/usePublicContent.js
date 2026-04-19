import { useEffect, useState } from 'react';
import { fetchPublicContent } from '../services/api';

const defaultSections = {
  hero: {
    key: 'hero',
    title: 'Atencion medica clara, cercana y sin friccion',
    content: 'Reserva tu hora y navega por la pagina con una experiencia limpia, abierta y continua.'
  },
  about: {
    key: 'about',
    title: 'Sobre mi',
    content:
      'Acompanamiento profesional con una mirada cercana, clara y humana en cada etapa de la atencion.'
  },
  services: {
    key: 'services',
    title: 'Servicios',
    content: 'Explora prestaciones pensadas para seguimiento, orientacion y cuidado continuo.'
  },
  comments: {
    key: 'comments',
    title: 'Testimonios',
    content: 'Comentarios reales de pacientes sobre su experiencia de atencion.'
  },
  contact: {
    key: 'contact',
    title: 'Contacto',
    content: 'Escribenos para resolver dudas, solicitar informacion o coordinar tu atencion.'
  },
  booking: {
    key: 'booking',
    title: 'Agenda tu atencion',
    content:
      'Selecciona el dia y luego una hora disponible en un calendario visual conectado a la agenda real.'
  }
};

const defaultPublicContent = {
  hero: {
    title: defaultSections.hero.title,
    description: defaultSections.hero.content
  },
  sections: defaultSections,
  services: [],
  testimonials: [],
  gallery: [],
  socialLinks: [],
  weeklyAvailability: []
};

const toSectionMap = (sections) => {
  if (!sections) {
    return {};
  }

  if (Array.isArray(sections)) {
    return Object.fromEntries(
      sections.map((item) => [
        item.key,
        {
          key: item.key,
          title: item.title,
          content: item.content
        }
      ])
    );
  }

  return sections;
};

const normalizePublicContent = (response = {}) => {
  const incomingSections = toSectionMap(response.sections);
  const sections = {
    ...defaultSections,
    ...incomingSections
  };

  return {
    ...defaultPublicContent,
    ...response,
    hero: {
      title: response.hero?.title || sections.hero.title,
      description: response.hero?.description || sections.hero.content
    },
    sections,
    services: response.services || [],
    testimonials: response.testimonials || [],
    gallery: response.gallery || [],
    socialLinks: response.socialLinks || [],
    weeklyAvailability: response.weeklyAvailability || []
  };
};

export default function usePublicContent() {
  const [content, setContent] = useState(defaultPublicContent);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const response = await fetchPublicContent();

        if (!isMounted) {
          return;
        }

        setContent(normalizePublicContent(response));
        setStatusMessage('');
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setContent(defaultPublicContent);
        setStatusMessage('No fue posible cargar el backend. Se muestra una base visual temporal.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    content,
    statusMessage,
    isLoading
  };
}
