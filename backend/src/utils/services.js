import { pool } from '../config/db.js';

const buildImageMap = (rows = []) =>
  rows.reduce((accumulator, row) => {
    const serviceId = Number(row.serviceId);
    const nextValue = accumulator.get(serviceId) || [];

    nextValue.push(row.imageData);
    accumulator.set(serviceId, nextValue);

    return accumulator;
  }, new Map());

export const normalizeServiceImagesInput = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .filter((image) => typeof image === 'string' && image.trim())
    .map((image) => image.trim())
    .slice(0, 10);
};

export const fetchServicesWithImages = async ({ onlyActive = false } = {}) => {
  const [services] = await pool.query(
    `
      SELECT
        id,
        title,
        description,
        price,
        currency,
        duration_minutes AS durationMinutes,
        image_url AS imageUrl,
        is_active AS isActive,
        order_index AS orderIndex
      FROM services
      ${onlyActive ? 'WHERE is_active = 1' : ''}
      ORDER BY order_index, id
    `
  );

  if (!services.length) {
    return [];
  }

  const serviceIds = services.map((service) => service.id);
  const placeholders = serviceIds.map(() => '?').join(', ');
  const [imageRows] = await pool.query(
    `
      SELECT
        id,
        service_id AS serviceId,
        image_data AS imageData,
        sort_order AS sortOrder
      FROM service_images
      WHERE service_id IN (${placeholders})
      ORDER BY service_id, sort_order, id
    `,
    serviceIds
  );

  const imageMap = buildImageMap(imageRows);

  return services.map((service) => {
    const images = imageMap.get(service.id) || [];
    const mergedImages = images.length
      ? images
      : service.imageUrl
        ? [service.imageUrl]
        : [];

    return {
      ...service,
      imageUrl: mergedImages[0] || '',
      images: mergedImages
    };
  });
};

export const replaceServiceImages = async (connection, serviceId, images) => {
  await connection.query('DELETE FROM service_images WHERE service_id = ?', [serviceId]);

  for (const [index, imageData] of images.entries()) {
    await connection.query(
      `
        INSERT INTO service_images (service_id, image_data, sort_order)
        VALUES (?, ?, ?)
      `,
      [serviceId, imageData, index]
    );
  }
};
