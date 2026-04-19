USE matrona_landing;

INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin', '$2a$10$BugBcsJEUtPGT09kCl.Ri.fxwGyllfFPucemnepgNYawRihYC2Ona', 'admin')
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = VALUES(role);

INSERT INTO site_sections (`key`, title, content)
VALUES
  (
    'hero',
    'Atencion cercana para cada etapa de tu salud',
    'Reserva online, conoce los servicios disponibles y navega una experiencia clara, limpia y facil de usar.'
  ),
  (
    'about',
    'Sobre mi',
    'Profesional enfocada en acompanamiento cercano, seguimiento continuo y atencion clara para cada paciente. Cada consulta busca combinar calidez, criterio profesional y una experiencia simple de principio a fin.'
  ),
  (
    'services',
    'Servicios',
    'Explora prestaciones pensadas para control, orientacion y seguimiento. Cada servicio se puede administrar desde el panel y mostrar automaticamente en la pagina publica.'
  ),
  (
    'comments',
    'Testimonios',
    'Experiencias reales de pacientes que valoran una atencion humana, ordenada y profesional.'
  ),
  (
    'contact',
    'Contacto',
    'Si tienes dudas, necesitas informacion adicional o quieres coordinar tu atencion, puedes escribirnos desde esta seccion.'
  ),
  (
    'booking',
    'Agenda tu atencion',
    'Selecciona un dia disponible, revisa los bloques creados por el administrador y reserva tu hora con el servicio que necesitas.'
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  content = VALUES(content);

DELETE FROM services
WHERE title IN (
  'Control pre y post natal',
  'Consejeria en lactancia',
  'Control ginecologico preventivo',
  'Educacion para familias'
);

INSERT INTO services (title, description, price, currency, duration_minutes, image_url, is_active, order_index)
VALUES
  (
    'Control pre y post natal',
    'Acompanamiento integral antes y despues del parto con seguimiento cercano y orientacion personalizada.',
    35000,
    'CLP',
    60,
    'https://images.unsplash.com/photo-1584516150909-c43483ee7938',
    1,
    1
  ),
  (
    'Consejeria en lactancia',
    'Apoyo practico y profesional para resolver dudas, mejorar postura y fortalecer el proceso de lactancia.',
    28000,
    'CLP',
    45,
    'https://images.unsplash.com/photo-1516549655169-df83a0774514',
    1,
    2
  ),
  (
    'Control ginecologico preventivo',
    'Consulta orientada a prevencion, evaluacion general y resolucion de inquietudes frecuentes.',
    32000,
    'CLP',
    45,
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    1,
    3
  ),
  (
    'Educacion para familias',
    'Sesiones para preparar embarazo, puerperio, cuidados del recien nacido y decisiones informadas.',
    26000,
    'CLP',
    60,
    'https://images.unsplash.com/photo-1513245543132-31f507417b26',
    1,
    4
  );

DELETE FROM gallery_items
WHERE title IN ('Atencion personalizada', 'Seguimiento cercano', 'Cuidado continuo');

INSERT INTO gallery_items (title, description, image_url, is_active, order_index)
VALUES
  (
    'Atencion personalizada',
    'Espacios de consulta y acompanamiento centrados en cada paciente.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
    1,
    1
  ),
  (
    'Seguimiento cercano',
    'Instancias de control y orientacion profesional con una experiencia amable y clara.',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54',
    1,
    2
  ),
  (
    'Cuidado continuo',
    'Prestaciones pensadas para cada etapa, con foco en confianza y acompanamiento.',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
    1,
    3
  );

INSERT INTO weekly_availability (day_of_week, is_enabled, start_time, end_time, slot_minutes)
VALUES
  (0, 0, NULL, NULL, 60),
  (1, 1, '08:00:00', '17:00:00', 60),
  (2, 1, '09:00:00', '17:00:00', 30),
  (3, 1, '08:30:00', '16:30:00', 30),
  (4, 1, '09:00:00', '18:00:00', 60),
  (5, 1, '10:00:00', '16:00:00', 30),
  (6, 0, NULL, NULL, 60)
ON DUPLICATE KEY UPDATE
  is_enabled = VALUES(is_enabled),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  slot_minutes = VALUES(slot_minutes);

DELETE FROM social_links
WHERE platform IN ('Instagram', 'WhatsApp', 'Correo');

INSERT INTO social_links (platform, url, is_active)
VALUES
  ('Instagram', 'https://instagram.com/', 1),
  ('WhatsApp', 'https://wa.me/56900000000', 1),
  ('Correo', 'mailto:contacto@lagunasalud.cl', 1);

DELETE FROM testimonials
WHERE patient_name_alias IN (
  'Valentina R.',
  'Camila S.',
  'Daniela M.',
  'Fernanda P.',
  'Javiera A.',
  'Constanza G.'
);

INSERT INTO testimonials (patient_name_alias, content, rating, is_visible, status, created_at)
VALUES
  (
    'Valentina R.',
    'Me senti acompanada en todo momento. La reserva fue simple y la atencion muy cercana.',
    5,
    1,
    'approved',
    '2026-04-10 09:15:00'
  ),
  (
    'Camila S.',
    'Todo fue claro desde la primera consulta. Me dio mucha tranquilidad resolver dudas importantes.',
    5,
    1,
    'approved',
    '2026-04-11 12:10:00'
  ),
  (
    'Daniela M.',
    'Me gusto mucho la calidez de la atencion y la forma tan humana de explicar cada paso.',
    5,
    1,
    'approved',
    '2026-04-12 16:40:00'
  ),
  (
    'Fernanda P.',
    'La agenda online fue rapida y despues la experiencia presencial fue ordenada y muy amable.',
    4,
    1,
    'approved',
    '2026-04-13 10:20:00'
  ),
  (
    'Javiera A.',
    'Senti mucha confianza durante el seguimiento. Todo se vio prolijo, claro y profesional.',
    5,
    1,
    'approved',
    '2026-04-14 14:05:00'
  ),
  (
    'Constanza G.',
    'Muy buena experiencia. Los horarios estaban claros y la atencion fue delicada y atenta.',
    4,
    1,
    'approved',
    '2026-04-15 11:30:00'
  );
