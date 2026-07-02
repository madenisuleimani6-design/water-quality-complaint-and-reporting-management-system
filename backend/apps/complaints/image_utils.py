"""Resize and compress complaint photos before persistence."""

from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image, ImageOps

MAX_PHOTO_EDGE = 1920
JPEG_QUALITY = 85
MAX_OUTPUT_BYTES = 5 * 1024 * 1024


def optimize_complaint_photo(uploaded_file):
    """
    Normalize uploads to JPEG, correct orientation, and cap dimensions/size.
    """
    uploaded_file.seek(0)
    with Image.open(uploaded_file) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")

        width, height = image.size
        longest = max(width, height)
        if longest > MAX_PHOTO_EDGE:
            scale = MAX_PHOTO_EDGE / longest
            image = image.resize(
                (max(1, int(width * scale)), max(1, int(height * scale))),
                Image.Resampling.LANCZOS,
            )

        quality = JPEG_QUALITY
        buffer = BytesIO()
        image.save(buffer, format="JPEG", quality=quality, optimize=True)

        while buffer.tell() > MAX_OUTPUT_BYTES and quality > 50:
            quality -= 10
            buffer = BytesIO()
            image.save(buffer, format="JPEG", quality=quality, optimize=True)

    buffer.seek(0)
    original_name = getattr(uploaded_file, "name", "complaint-photo.jpg")
    stem = original_name.rsplit(".", 1)[0] if "." in original_name else original_name
    return InMemoryUploadedFile(
        buffer,
        field_name=getattr(uploaded_file, "field_name", "photo"),
        name=f"{stem}.jpg",
        content_type="image/jpeg",
        size=buffer.getbuffer().nbytes,
        charset=None,
    )
