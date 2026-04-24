import { useEffect, useState } from 'react';
import AppModal from './AppModal';

const createInitialForm = (service) => ({
  title: service?.title || '',
  description: service?.description || '',
  price: String(service?.price ?? '0'),
  currency: service?.currency || 'CLP',
  durationMinutes: String(service?.durationMinutes ?? 60),
  images: Array.isArray(service?.images) ? [...service.images] : [],
  isActive: service?.isActive ?? true,
  orderIndex: String(service?.orderIndex ?? 0)
});

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`No fue posible leer ${file.name}.`));
    reader.readAsDataURL(file);
  });

export default function ServiceEditorModal({
  isOpen,
  mode,
  service,
  durationOptions,
  isSubmitting,
  onClose,
  onSubmit
}) {
  const [form, setForm] = useState(createInitialForm(service));
  const [imageStatus, setImageStatus] = useState({
    type: '',
    message: ''
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(createInitialForm(service));
    setImageStatus({
      type: '',
      message: ''
    });
  }, [isOpen, service]);

  const handleFieldChange = (field, value) => {
    setForm((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };

  const handleAddImages = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';

    if (!selectedFiles.length) {
      return;
    }

    const onlyImages = selectedFiles.filter((file) => file.type.startsWith('image/'));

    if (!onlyImages.length) {
      setImageStatus({
        type: 'error',
        message: 'Solo puedes cargar archivos de imagen.'
      });
      return;
    }

    const availableSlots = Math.max(0, 10 - form.images.length);
    const filesToRead = onlyImages.slice(0, availableSlots);

    if (!filesToRead.length) {
      setImageStatus({
        type: 'error',
        message: 'Cada servicio admite maximo 10 imagenes.'
      });
      return;
    }

    try {
      const nextImages = await Promise.all(filesToRead.map(readFileAsDataUrl));
      setForm((currentValue) => ({
        ...currentValue,
        images: [...currentValue.images, ...nextImages]
      }));

      setImageStatus({
        type: filesToRead.length !== onlyImages.length ? 'error' : 'success',
        message:
          filesToRead.length !== onlyImages.length
            ? 'Se cargaron imagenes hasta completar el limite de 10.'
            : `${filesToRead.length} imagen${filesToRead.length === 1 ? '' : 'es'} cargada${filesToRead.length === 1 ? '' : 's'}.`
      });
    } catch (error) {
      setImageStatus({
        type: 'error',
        message: error.message || 'No fue posible procesar las imagenes.'
      });
    }
  };

  const handleRemoveImage = (imageIndex) => {
    setForm((currentValue) => ({
      ...currentValue,
      images: currentValue.images.filter((_, index) => index !== imageIndex)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar servicio' : 'Nuevo servicio'}
      subtitle="Actualiza el detalle, administra imagenes y deja lista la vista publica desde un solo flujo."
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancelar
          </button>

          <button
            type="submit"
            form="service-editor-form"
            className="button button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Crear servicio'}
          </button>
        </>
      }
    >
      <form id="service-editor-form" className="service-modal-form" onSubmit={handleSubmit}>
        <div className="field-grid service-modal-grid">
          <label className="field">
            <span>Titulo</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => handleFieldChange('title', event.target.value)}
              placeholder="Nombre del servicio"
              required
            />
          </label>

          <label className="field">
            <span>Precio</span>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) => handleFieldChange('price', event.target.value)}
              placeholder="35000"
              required
            />
          </label>

          <label className="field">
            <span>Duracion</span>
            <select
              value={form.durationMinutes}
              onChange={(event) => handleFieldChange('durationMinutes', event.target.value)}
            >
              {durationOptions.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutos
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Orden</span>
            <input
              type="number"
              min="0"
              value={form.orderIndex}
              onChange={(event) => handleFieldChange('orderIndex', event.target.value)}
            />
          </label>

          <label className="field admin-inline-field">
            <span>Visible</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => handleFieldChange('isActive', event.target.checked)}
            />
          </label>

          <label className="field admin-form-span-2">
            <span>Descripcion</span>
            <textarea
              rows="5"
              value={form.description}
              onChange={(event) => handleFieldChange('description', event.target.value)}
              placeholder="Describe el servicio y lo que incluye."
              required
            />
          </label>
        </div>

        <div className="service-images-panel">
          <div className="service-images-header">
            <div>
              <span className="flow-label">Imagenes</span>
              <strong>{form.images.length} / 10 cargadas</strong>
            </div>

            <label className="service-upload-button">
              <input type="file" accept="image/*" multiple onChange={handleAddImages} />
              Agregar imagenes
            </label>
          </div>

          <p className="service-images-copy">
            Puedes subir hasta 10 imagenes por servicio. Se almacenan como base64 para quedar
            asociadas directamente en la base de datos.
          </p>

          {imageStatus.message ? (
            <p className={`form-status ${imageStatus.type}`}>{imageStatus.message}</p>
          ) : null}

          <div className="service-images-grid">
            {form.images.length ? (
              form.images.map((image, index) => (
                <article key={`${image.slice(0, 24)}-${index}`} className="service-image-card">
                  <img
                    src={image}
                    alt={`Vista previa ${index + 1}`}
                    className="service-image-preview"
                  />

                  <div className="service-image-meta">
                    <span>Imagen {index + 1}</span>
                    <button
                      type="button"
                      className="service-image-remove"
                      onClick={() => handleRemoveImage(index)}
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="service-images-empty">
                <strong>Sin imagenes aun</strong>
                <p>Sube archivos para mostrar previews dentro del modal y en la pagina publica.</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </AppModal>
  );
}
