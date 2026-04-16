CREATE DATABASE IF NOT EXISTS matrona_landing CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE matrona_landing;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(140) NOT NULL,
  content TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name_alias VARCHAR(120) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_used TINYINT(1) DEFAULT 0,
  expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) UNIQUE NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  source VARCHAR(80) DEFAULT 'landing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 1
);

INSERT INTO site_sections (`key`, title, content)
VALUES ('hero', 'Matrona Contigo', 'Cuidado profesional, cálido y cercano para cada etapa de tu maternidad.')
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content);

INSERT INTO services (title, description, image_url, order_index)
VALUES
('Control pre y post natal', 'Acompañamiento integral antes y después del parto.', 'https://images.unsplash.com/photo-1584516150909-c43483ee7938', 1),
('Educación para familias', 'Talleres sobre lactancia, puerperio y cuidados del recién nacido.', 'https://images.unsplash.com/photo-1513245543132-31f507417b26', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO social_links (platform, url)
VALUES
('Instagram', 'https://instagram.com/'),
('YouTube', 'https://youtube.com/')
ON DUPLICATE KEY UPDATE url = VALUES(url);
