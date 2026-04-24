import { useEffect, useState } from 'react';
import { fetchPublicContent } from '../services/api';

const PUBLIC_CONTENT_CACHE_KEY = 'matrona-public-content-cache';
const PUBLIC_CONTENT_CACHE_TTL_MS = 60 * 1000;

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

let memoryCacheEntry = null;
let inFlightContentRequest = null;

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

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.sessionStorage);

const isCacheFresh = (entry) =>
  Boolean(entry?.timestamp) && Date.now() - entry.timestamp < PUBLIC_CONTENT_CACHE_TTL_MS;

const saveCacheEntry = (entry) => {
  memoryCacheEntry = entry;

  if (!canUseStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(PUBLIC_CONTENT_CACHE_KEY, JSON.stringify(entry));
  } catch (_error) {
    // Ignore storage failures and keep the in-memory cache.
  }
};

const readStoredCacheEntry = () => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(PUBLIC_CONTENT_CACHE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue?.data) {
      return null;
    }

    return {
      timestamp: Number(parsedValue.timestamp || 0),
      data: normalizePublicContent(parsedValue.data)
    };
  } catch (_error) {
    return null;
  }
};

const getCachedEntry = () => {
  if (memoryCacheEntry) {
    return memoryCacheEntry;
  }

  const storedEntry = readStoredCacheEntry();
  if (storedEntry) {
    memoryCacheEntry = storedEntry;
  }

  return storedEntry;
};

export const clearPublicContentCache = () => {
  memoryCacheEntry = null;
  inFlightContentRequest = null;

  if (!canUseStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(PUBLIC_CONTENT_CACHE_KEY);
  } catch (_error) {
    // Ignore storage failures.
  }
};

const loadPublicContent = async () => {
  const cachedEntry = getCachedEntry();

  if (isCacheFresh(cachedEntry)) {
    return cachedEntry.data;
  }

  if (inFlightContentRequest) {
    return inFlightContentRequest;
  }

  inFlightContentRequest = fetchPublicContent()
    .then((response) => {
      const normalizedResponse = normalizePublicContent(response);

      saveCacheEntry({
        timestamp: Date.now(),
        data: normalizedResponse
      });

      return normalizedResponse;
    })
    .finally(() => {
      inFlightContentRequest = null;
    });

  return inFlightContentRequest;
};

export default function usePublicContent() {
  const [content, setContent] = useState(() => getCachedEntry()?.data || defaultPublicContent);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(() => !getCachedEntry());

  useEffect(() => {
    let isMounted = true;
    const cachedEntry = getCachedEntry();

    if (cachedEntry?.data) {
      setContent(cachedEntry.data);
      setIsLoading(false);
    }

    const loadContent = async () => {
      try {
        const response = await loadPublicContent();

        if (!isMounted) {
          return;
        }

        setContent(response);
        setStatusMessage('');
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        if (!cachedEntry?.data) {
          setContent(defaultPublicContent);
          setStatusMessage('No fue posible cargar el backend. Se muestra una base visual temporal.');
        }
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
