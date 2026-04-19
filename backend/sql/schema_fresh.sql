DROP DATABASE IF EXISTS matrona_landing;
CREATE DATABASE matrona_landing CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE matrona_landing;

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE site_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(140) NOT NULL,
  content TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'CLP',
  duration_minutes INT NOT NULL DEFAULT 60,
  image_url VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name_alias VARCHAR(120) NOT NULL,
  content TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE review_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_used TINYINT(1) DEFAULT 0,
  expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(140) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE weekly_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_of_week TINYINT UNSIGNED NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 0,
  start_time TIME NULL,
  end_time TIME NULL,
  slot_minutes INT NOT NULL DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_weekly_availability_day (day_of_week)
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NULL,
  service_id INT NULL,
  service_name VARCHAR(160) NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  end_time TIME NULL,
  slot_minutes INT NULL,
  notes TEXT NULL,
  status ENUM('new', 'confirmed', 'completed', 'cancelled') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_appointments_date_time (preferred_date, preferred_time),
  INDEX idx_appointments_status (status)
);

CREATE TABLE subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) UNIQUE NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  source VARCHAR(80) DEFAULT 'landing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE social_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 1
);

INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin', '$2a$10$BugBcsJEUtPGT09kCl.Ri.fxwGyllfFPucemnepgNYawRihYC2Ona', 'admin');

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
  );

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
  (6, 0, NULL, NULL, 60);

INSERT INTO social_links (platform, url, is_active)
VALUES
  ('Instagram', 'https://instagram.com/', 1),
  ('WhatsApp', 'https://wa.me/56900000000', 1),
  ('Correo', 'mailto:contacto@lagunasalud.cl', 1);
