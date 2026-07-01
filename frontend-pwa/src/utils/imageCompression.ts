const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;

export async function compressImage(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return uri;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const compressedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Failed to compress image"));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  return URL.createObjectURL(compressedBlob);
}
