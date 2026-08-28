(function () {
  const supabaseConfig = {
    url: 'https://knluuivcmkcpdpdbradu.supabase.co',
    key: 'sb_publishable_4aY-b3C33L2di9Z5YHAbJg_gj5ncEvD',
    bucket: 'tees'
  };

  const isConfigured = value => typeof value === 'string' && value.trim().length > 0 && !value.includes('TU_');
  const url = (supabaseConfig.url || '').trim();
  const key = (supabaseConfig.key || '').trim();
  const bucket = (supabaseConfig.bucket || 'products').trim();

  window.novaSupabaseConfig = { ...supabaseConfig, bucket };
  window.novaStorageConfigured = isConfigured(url) && isConfigured(key) && typeof window.supabase !== 'undefined';
  window.novaSupabase = window.novaStorageConfigured
    ? window.supabase.createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

  window.getSupabaseStorageUrl = function getSupabaseStorageUrl(path) {
    const safePath = String(path || '').trim();
    if (!safePath) return '';
    if (/^(https?:|data:image\/)/i.test(safePath)) return safePath;
    return `${url}/storage/v1/object/public/${bucket}/${safePath.replace(/^\/+/, '')}`;
  };

  window.uploadToSupabaseStorage = async function uploadToSupabaseStorage(file, targetPath) {
    if (!file) {
      throw new Error('Debes seleccionar una imagen.');
    }

    if (!window.novaSupabase) {
      throw new Error('Supabase Storage no está configurado. Añade la URL y la anon key del proyecto.');
    }

    const objectPath = (targetPath || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')}`).replace(/^\/+/, '');
    const { error } = await window.novaSupabase.storage.from(bucket).upload(objectPath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'application/octet-stream'
    });

    if (error) {
      throw error;
    }

    return window.getSupabaseStorageUrl(objectPath);
  };
})();
