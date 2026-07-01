import * as ImageManipulator from "expo-image-manipulator";

import { isWeb } from "./platform";

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;

async function compressOnNative(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  return result.uri;
}

async function compressOnWeb(uri: string): Promise<string> {
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
  if (!ctx) {
    return uri;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const compressedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to compress image"));
        }
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  return URL.createObjectURL(compressedBlob);
}

export async function compressImage(uri: string): Promise<string> {
  if (isWeb) {
    return compressOnWeb(uri);
  }
  return compressOnNative(uri);
}
