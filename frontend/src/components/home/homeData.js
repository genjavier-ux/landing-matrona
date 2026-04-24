export const fallbackContent = {
  hero: {
    title: 'Matrona Contigo',
    description: 'Cuidado profesional, calido y cercano para cada etapa de tu maternidad.'
  }
};

const createMockServiceVisual = (title, subtitle, colorA, colorB) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="hero" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="${colorB}" />
        </linearGradient>
        <linearGradient id="panel" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#fff9fb" />
          <stop offset="100%" stop-color="#ffe8ef" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="#fffafb" />
      <circle cx="980" cy="150" r="160" fill="${colorB}" fill-opacity="0.26" />
      <circle cx="180" cy="720" r="210" fill="${colorA}" fill-opacity="0.18" />
      <rect x="120" y="120" width="960" height="660" rx="54" fill="url(#panel)" stroke="#f0d2dc" stroke-width="3" />
      <rect x="180" y="210" width="340" height="340" rx="42" fill="url(#hero)" fill-opacity="0.84" />
      <circle cx="350" cy="380" r="94" fill="#ffffff" fill-opacity="0.55" />
      <rect x="590" y="260" width="350" height="28" rx="14" fill="#df7d9a" fill-opacity="0.34" />
      <rect x="590" y="320" width="250" height="18" rx="9" fill="#c68ea0" fill-opacity="0.32" />
      <rect x="590" y="520" width="290" height="18" rx="9" fill="#c68ea0" fill-opacity="0.28" />
      <rect x="590" y="560" width="210" height="18" rx="9" fill="#c68ea0" fill-opacity="0.22" />
      <text x="590" y="410" fill="#2f2f33" font-size="78" font-family="Arial, sans-serif" font-weight="700">${title}</text>
      <text x="590" y="470" fill="#875f6e" font-size="34" font-family="Arial, sans-serif">${subtitle}</text>
    </svg>
  `)}`;

const buildGallery = (title, toneA, toneB) => [
  createMockServiceVisual(title, 'Evaluacion inicial', toneA, toneB),
  createMockServiceVisual(title, 'Acompanamiento cercano', toneB, toneA),
  createMockServiceVisual(title, 'Seguimiento personalizado', toneA, '#f9d2df')
];

export const mockServices = [
  {
    id: 'mock-service-1',
    title: 'Control prenatal integral',
    description:
      'Acompanamiento durante el embarazo con seguimiento, orientacion clara y espacio para resolver dudas importantes.',
    imageUrl: createMockServiceVisual('Prenatal', 'Control integral', '#f6c9d8', '#ef8ea8'),
    gallery: buildGallery('Prenatal', '#f7c8d7', '#ef96ad')
  },
  {
    id: 'mock-service-2',
    title: 'Plan de parto consciente',
    description:
      'Preparacion para vivir el nacimiento con informacion, calma y decisiones alineadas con tus necesidades.',
    imageUrl: createMockServiceVisual('Parto', 'Plan personalizado', '#f5d3dd', '#eab0c4'),
    gallery: buildGallery('Parto', '#f5d3dd', '#e7a8bf')
  },
  {
    id: 'mock-service-3',
    title: 'Postparto respetado',
    description:
      'Contencion en los primeros dias para transitar cambios fisicos, emocionales y practicos con mas tranquilidad.',
    imageUrl: createMockServiceVisual('Postparto', 'Recuperacion guiada', '#f9dce5', '#f4b7ca')
  },
  {
    id: 'mock-service-4',
    title: 'Lactancia y agarre',
    description:
      'Apoyo para mejorar postura, agarre y confianza durante la lactancia, con acompanamiento practico y amable.',
    imageUrl: createMockServiceVisual('Lactancia', 'Apoyo practico', '#fce0e8', '#ef98b0'),
    gallery: buildGallery('Lactancia', '#fad6e1', '#ef98b0')
  },
  {
    id: 'mock-service-5',
    title: 'Salud menstrual',
    description:
      'Espacio para conversar tu ciclo, sintomas y bienestar desde una mirada cercana, respetuosa y profesional.',
    imageUrl: createMockServiceVisual('Ciclo', 'Bienestar femenino', '#f8d6e6', '#f4a8c3')
  },
  {
    id: 'mock-service-6',
    title: 'Suelo pelvico y recuperacion',
    description:
      'Guia y derivacion oportuna para apoyar el bienestar corporal despues del parto y en otras etapas de la vida.',
    imageUrl: createMockServiceVisual('Pelvico', 'Recuperacion', '#f5d7e0', '#f0a6bc'),
    gallery: buildGallery('Pelvico', '#f5d7e0', '#ec9fb8')
  },
  {
    id: 'mock-service-7',
    title: 'Preparacion para familias',
    description:
      'Sesiones para anticipar dudas sobre nacimiento, cuidados iniciales y organizacion emocional del hogar.',
    imageUrl: createMockServiceVisual('Familias', 'Preparacion previa', '#f5d9e6', '#eca8c0')
  },
  {
    id: 'mock-service-8',
    title: 'Consejeria en duelo gestacional',
    description:
      'Acompanamiento sensible para transitar procesos complejos con escucha, respeto y contencion real.',
    imageUrl: createMockServiceVisual('Duelo', 'Acompanamiento', '#f1d6df', '#e79cb4'),
    gallery: buildGallery('Duelo', '#f1d6df', '#e79cb4')
  },
  {
    id: 'mock-service-9',
    title: 'Charlas y talleres',
    description:
      'Instancias educativas para grupos, familias o equipos que necesitan informacion clara y cercana.',
    imageUrl: createMockServiceVisual('Talleres', 'Educacion cercana', '#f8dfea', '#efb4c7')
  },
  {
    id: 'mock-service-10',
    title: 'Asesoria online personalizada',
    description:
      'Consultas remotas para acompanarte desde cualquier lugar con la misma cercania y continuidad.',
    imageUrl: createMockServiceVisual('Online', 'Orientacion remota', '#f8d6df', '#ef90ac'),
    gallery: buildGallery('Online', '#f8d6df', '#ef90ac')
  }
];

export const servicesPerPage = 4;

export const mockTestimonials = [
  {
    id: 'mock-1',
    name: 'Camila R.',
    handle: '@camila.mama',
    quote: 'Me senti acompanada desde la primera consulta. Todo fue claro, amable y muy humano.',
    rating: 5
  },
  {
    id: 'mock-2',
    name: 'Valentina P.',
    handle: '@vale.postparto',
    quote: 'Transmitio muchisima calma. Resolvimos dudas de lactancia y sali con mucha confianza.',
    rating: 5
  },
  {
    id: 'mock-3',
    name: 'Daniela S.',
    handle: '@daniela.familia',
    quote: 'La atencion fue cercana y profesional. Se noto dedicacion real en cada detalle.',
    rating: 4
  },
  {
    id: 'mock-4',
    name: 'Paula M.',
    handle: '@paula.control',
    quote: 'Nos sentimos escuchados y contenidos. Fue una experiencia muy tranquila y respetuosa.',
    rating: 5
  },
  {
    id: 'mock-5',
    name: 'Fernanda T.',
    handle: '@fer.maternidad',
    quote: 'Muy clara para explicar y muy amorosa para acompanar. La recomendaria totalmente.',
    rating: 5
  }
];

export const navItems = [
  { id: 'inicio', label: 'Home' },
  { id: 'sobre-mi', label: 'Sobre mi' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'comentarios', label: 'Comentarios' },
  { id: 'contacto', label: 'Contacto' }
];

export const placeholderSections = [{ id: 'contacto', label: 'Contacto' }];
