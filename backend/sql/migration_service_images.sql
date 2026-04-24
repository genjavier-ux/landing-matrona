USE matrona_landing;

CREATE TABLE IF NOT EXISTS service_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  image_data LONGTEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_service_images_service_id (service_id)
);

INSERT INTO service_images (service_id, image_data, sort_order)
SELECT
  s.id,
  s.image_url,
  0
FROM services s
WHERE s.image_url IS NOT NULL
  AND s.image_url <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM service_images si
    WHERE si.service_id = s.id
  );
