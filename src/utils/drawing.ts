interface Point {
  x: number;
  y: number;
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  brushSize: number
): void {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  const startPos = (startY * width + startX) * 4;
  const targetR = pixels[startPos];
  const targetG = pixels[startPos + 1];
  const targetB = pixels[startPos + 2];
  const targetA = pixels[startPos + 3];

  const fillR = parseInt(fillColor.slice(1, 3), 16);
  const fillG = parseInt(fillColor.slice(3, 5), 16);
  const fillB = parseInt(fillColor.slice(5, 7), 16);
  const fillA = 255;

  if (
    targetR === fillR &&
    targetG === fillG &&
    targetB === fillB &&
    targetA === fillA
  ) {
    return;
  }

  const stack: Point[] = [{ x: startX, y: startY }];

  while (stack.length) {
    const { x, y } = stack.pop()!;
    const pos = (y * width + x) * 4;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (
      pixels[pos] !== targetR ||
      pixels[pos + 1] !== targetG ||
      pixels[pos + 2] !== targetB ||
      pixels[pos + 3] !== targetA
    )
      continue;

    pixels[pos] = fillR;
    pixels[pos + 1] = fillG;
    pixels[pos + 2] = fillB;
    pixels[pos + 3] = fillA;

    stack.push(
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    );
  }

  ctx.putImageData(imageData, 0, 0);
}
