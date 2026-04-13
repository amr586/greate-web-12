export async function compressImage(file: File, maxW = 1024, quality = 0.75): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxW) {
        height = Math.round((height * maxW) / width);
        width = maxW;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

export async function compressAndUploadMultiple(
  files: File[],
  token: string | null,
  onProgress?: (done: number, total: number) => void,
): Promise<string[]> {
  const urls: string[] = [];
  let done = 0;
  await Promise.all(
    files.map(async (file) => {
      try {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append('image', compressed, file.name.replace(/\.[^.]+$/, '.jpg'));
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) urls.push(data.url);
      } catch {}
      done++;
      onProgress?.(done, files.length);
    }),
  );
  return urls;
}
