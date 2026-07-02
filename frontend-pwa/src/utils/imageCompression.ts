/** Target upload size (backend limit is 5 MB). */
export const PHOTO_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

const MAX_DIMENSION = 1600;
const INITIAL_JPEG_QUALITY = 0.82;
const MIN_JPEG_QUALITY = 0.5;
const QUALITY_STEP = 0.08;

async function loadImageSource(source: string | File | Blob): Promise<{
  bitmap: ImageBitmap;
}> {
  if (typeof source === "string") {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error("Failed to read photo");
    }
    const blob = await response.blob();
    return { bitmap: await createImageBitmap(blob) };
  }

  return { bitmap: await createImageBitmap(source) };
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Failed to compress image"));
      },
      "image/jpeg",
      quality,
    );
  });
}

export async function preparePhotoForUpload(
  source: string | File | Blob,
): Promise<File> {
  const { bitmap } = await loadImageSource(source);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Failed to prepare photo");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = INITIAL_JPEG_QUALITY;
  let blob = await canvasToJpegBlob(canvas, quality);

  while (blob.size > PHOTO_UPLOAD_MAX_BYTES && quality > MIN_JPEG_QUALITY) {
    quality = Math.max(MIN_JPEG_QUALITY, quality - QUALITY_STEP);
    blob = await canvasToJpegBlob(canvas, quality);
  }

  return new File([blob], "complaint-photo.jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/** @deprecated Use preparePhotoForUpload — kept for preview URLs after capture. */
export async function compressImage(uri: string): Promise<string> {
  const file = await preparePhotoForUpload(uri);
  return URL.createObjectURL(file);
}
