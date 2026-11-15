const maxEdge = 1600;
const maxBytes = 900 * 1024;

export async function shrinkImage(file: File) {
  if (file.size === 0 || !file.type.startsWith("image/")) {
    return file;
  }
  if (file.size <= maxBytes && file.type === "image/jpeg") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let quality = 0.82;
    let blob: Blob | null = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });
      if (blob && blob.size <= maxBytes) {
        break;
      }
      quality -= 0.12;
    }
    if (!blob) {
      return file;
    }
    const name = file.name.replace(/\.[^.]+$/, "") || "gorsel";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function shrinkFormFiles(formData: FormData, field: string) {
  const files = formData
    .getAll(field)
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length === 0) {
    return 0;
  }

  formData.delete(field);
  let total = 0;
  for (const file of files) {
    const next = await shrinkImage(file);
    total += next.size;
    formData.append(field, next);
  }
  return total;
}
