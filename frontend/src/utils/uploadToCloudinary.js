const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dexlzykqm';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'eduplay_apps';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const uploadToCloudinary = async (file, type = 'image') => {
  // APK/raw files: route through backend (signed upload — 100MB limit)
  if (type === 'apk' || type === 'file') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    return {
      url: result.data.url,
      publicId: result.data.publicId,
    };
  }

  // Images: upload directly to Cloudinary (unsigned)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `eduplay/${type}s`);

  try {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload error response:', errorData);
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
