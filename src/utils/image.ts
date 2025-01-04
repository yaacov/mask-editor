export function extractFilename(
  backgroundImage: string,
  suggestedFilename: string
): string {
  if (backgroundImage.startsWith('data:')) {
    return suggestedFilename || 'mask-image';
  }
  const urlParts = backgroundImage.split('/');
  const fullFilename = urlParts[urlParts.length - 1];
  return fullFilename.split('.')[0];
}

export function processImageData(imageData: ImageData, onColor: string): void {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 125) {
      data[i] = onColor.length === 7 ? parseInt(onColor.slice(1, 3), 16) : 0;
      data[i + 1] =
        onColor.length === 7 ? parseInt(onColor.slice(3, 5), 16) : 0;
      data[i + 2] =
        onColor.length === 7 ? parseInt(onColor.slice(5, 7), 16) : 0;
      data[i + 3] = 255;
    } else {
      data[i + 3] = 0;
    }
  }
}

export function convertToBlackAndWhite(imageData: ImageData): void {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    const value = alpha > 0 ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = value;
  }
}
