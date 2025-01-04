import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import {
  extractFilename,
  processImageData,
  convertToBlackAndWhite,
} from '../../utils/image';
import { drawLine, floodFill } from '../../utils/drawing';

export class ImageCanvas extends LitElement {
  @property({ type: Number }) brushSize = 10;
  @property({ type: String }) onColor = '#000000';
  @property({ type: Boolean }) isDrawing = false;
  @property({ type: Number }) width = 600;
  @property({ type: Number }) height = 500;
  @property({ type: String }) backgroundImage = '';
  @property({ type: Number }) alpha = 1.0;
  @property({ type: String }) mode: 'draw' | 'delete' | 'fill' | 'line' =
    'draw';
  @property({ type: String }) image = '';
  @property({ type: String }) private filename = 'mask-image';
  @property({ type: Number }) scale = 1.0;
  @property({ type: String }) suggestedFilename = '';

  private ctx: CanvasRenderingContext2D | null = null;
  private lastX: number = 0;
  private lastY: number = 0;
  private history: ImageData[] = [];
  private maxHistoryLength = 20; // Limit history to prevent memory issues
  private startX: number = 0;
  private startY: number = 0;
  private tempCanvas: HTMLCanvasElement | null = null;
  private originalState: ImageData | null = null;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }
    .container {
      position: relative;
      width: fit-content;
      height: fit-content;
      transform-origin: top left;
    }
    img {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
    }
    canvas {
      border: 1px solid #ccc;
      cursor:
        url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="none" stroke="black" stroke-width="2"/><circle cx="16" cy="16" r="1" fill="black"/></svg>')
          16 16,
        crosshair;
      position: absolute;
      top: 0;
      left: 0;
      opacity: var(--canvas-opacity, 1);
    }
    canvas.drawing {
      cursor:
        url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="rgba(0,0,0,0.2)" stroke="black" stroke-width="2"/><circle cx="16" cy="16" r="1" fill="black"/></svg>')
          16 16,
        crosshair;
    }
    canvas.deleting {
      cursor:
        url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="none" stroke="red" stroke-width="2"/><line x1="12" y1="16" x2="20" y2="16" stroke="red" stroke-width="2"/></svg>')
          16 16,
        crosshair;
    }
    canvas.filling {
      cursor:
        url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16,8 L20,12 L12,20 L8,16 Z" fill="none" stroke="black" stroke-width="2"/><path d="M20,20 L24,16 L20,24 Z" fill="black"/></svg>')
          16 16,
        crosshair;
    }
    canvas.line {
      cursor:
        url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="rgba(0,0,0,0.2)" stroke="black" stroke-width="2"/><circle cx="16" cy="16" r="1" fill="black"/></svg>')
          16 16,
        crosshair;
    }
  `;

  firstUpdated() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.globalAlpha = this.alpha;
      if (this.image) {
        this.initImage();
      }
    }

    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = this.width;
    this.tempCanvas.height = this.height;

    // Add keyboard event listener for Ctrl+Z
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') {
        this.undo();
      }
    });
  }

  private loadBackgroundImage() {
    if (!this.backgroundImage) return;
    this.filename = extractFilename(
      this.backgroundImage,
      this.suggestedFilename
    );

    const img = new Image();
    img.onload = () => {
      this.width = img.width;
      this.height = img.height;

      // Force re-render with new dimensions
      this.requestUpdate();
    };
    img.src = this.backgroundImage;
  }

  private initImage() {
    if (!this.image || !this.ctx) return;

    const img = new Image();
    img.onload = () => {
      if (this.ctx) {
        // Create a temporary canvas to process the image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.width;
        tempCanvas.height = this.height;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          // Draw the original image to the temp canvas
          tempCtx.drawImage(img, 0, 0, this.width, this.height);

          // Get the image data
          const imageData = tempCtx.getImageData(0, 0, this.width, this.height);
          processImageData(imageData, this.onColor);

          // Put the processed image data on the main canvas
          tempCtx.putImageData(imageData, 0, 0);
          this.ctx.drawImage(tempCanvas, 0, 0);
        }
      }
    };
    img.src = this.image;
  }

  clearCanvas() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('backgroundImage')) {
      this.loadBackgroundImage();
    }
    if (changedProperties.has('alpha')) {
      this.style.setProperty('--canvas-opacity', this.alpha.toString());
    }
    if (changedProperties.has('image')) {
      this.initImage();
    }
  }

  handleMouseDown(e: MouseEvent) {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    // Adjust coordinates for scale
    const currentX = Math.floor(
      e.clientX / this.scale - rect.left / this.scale
    );
    const currentY = Math.floor(
      e.clientY / this.scale - rect.top / this.scale
    );

    if (this.ctx) {
      // Set the composite operation based on mode
      this.ctx.globalCompositeOperation = this.mode === 'delete' ? 'destination-out' : 'source-over';
    }

    if (this.mode === 'fill' && this.ctx) {
      this.saveToHistory();
      canvas?.classList.add('filling');
      floodFill(
        this.ctx,
        currentX,
        currentY,
        this.onColor,
        this.width,
        this.height
      );
      canvas?.classList.remove('filling');
      return;
    }

    if (this.mode === 'line' && this.ctx) {
      this.saveToHistory();
      this.isDrawing = true;
      canvas?.classList.add('line');
      this.startX = currentX;
      this.startY = currentY;
      this.originalState = this.ctx.getImageData(0, 0, this.width, this.height);
      return;
    }

    // Original drawing/delete mode handling
    this.saveToHistory();
    this.isDrawing = true;
    canvas?.classList.add(this.mode === 'draw' ? 'drawing' : 'deleting');
    this.lastX = currentX;
    this.lastY = currentY;
  }

  handleMouseUp(e: MouseEvent) {
    if (this.mode === 'line' && this.isDrawing && this.ctx) {
      const canvas = this.renderRoot.querySelector(
        'canvas'
      ) as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const currentX = Math.floor(
        e.clientX / this.scale - rect.left / this.scale
      );
      const currentY = Math.floor(
        e.clientY / this.scale - rect.top / this.scale
      );

      // Restore the original state one last time
      if (this.originalState) {
        this.ctx.putImageData(this.originalState, 0, 0);
      }

      // Draw the final line
      drawLine(
        this.ctx,
        { x: this.startX, y: this.startY },
        { x: currentX, y: currentY },
        this.onColor,
        this.brushSize
      );

      // Clear the original state
      this.originalState = null;
    }

    this.isDrawing = false;
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    canvas?.classList.remove('drawing');
    canvas?.classList.remove('deleting');
    canvas?.classList.remove('line');
    this.ctx?.beginPath();
  }

  handleMouseMove(e: MouseEvent) {
    if (!this.isDrawing || !this.ctx) return;

    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX / this.scale - rect.left / this.scale;
    const currentY = e.clientY / this.scale - rect.top / this.scale;

    // Set the composite operation based on mode
    this.ctx.globalCompositeOperation = this.mode === 'delete' ? 'destination-out' : 'source-over';

    if (this.mode === 'line' && this.originalState) {
      this.ctx.putImageData(this.originalState, 0, 0);
      drawLine(
        this.ctx,
        { x: this.startX, y: this.startY },
        { x: currentX, y: currentY },
        this.onColor,
        this.brushSize
      );
      return;
    }

    drawLine(
      this.ctx,
      { x: this.lastX, y: this.lastY },
      { x: currentX, y: currentY },
      this.mode === 'delete' ? '#000000' : this.onColor,
      this.brushSize
    );

    this.lastX = currentX;
    this.lastY = currentY;
  }

  handleMouseLeave() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    canvas?.classList.remove('drawing');
    canvas?.classList.remove('deleting');
    canvas?.classList.remove('line');
    this.isDrawing = false;
    this.ctx?.beginPath();
    this.originalState = null;
  }

  handleMouseEnter(e: MouseEvent) {
    if (e.buttons === 1) {
      // Left mouse button is pressed
      this.handleMouseDown(e);
    }
  }

  saveImage() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // Draw the original canvas onto the temporary canvas
      tempCtx.drawImage(canvas, 0, 0);

      // Get the image data
      const imageData = tempCtx.getImageData(0, 0, this.width, this.height);
      convertToBlackAndWhite(imageData);

      // Put the modified image data back
      tempCtx.putImageData(imageData, 0, 0);
      this.downloadImage(tempCanvas.toDataURL('image/png'));
    }
  }

  private downloadImage(dataUrl: string) {
    const link = document.createElement('a');
    link.download = `${this.filename}.png`;
    link.href = dataUrl;
    link.click();
  }

  redrawMask() {
    if (!this.ctx) return;
    this.ctx.globalCompositeOperation = 'source-over';  // Reset composite operation
    this.clearCanvas();
    this.initImage();
  }

  private saveToHistory() {
    if (!this.ctx) return;

    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    this.history.push(imageData);

    // Maintain history length limit
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  private undo() {
    if (!this.ctx || this.history.length === 0) return;

    const previousState = this.history.pop();
    if (previousState) {
      // Clear the canvas first
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Reset drawing settings
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = this.alpha;

      // Restore the previous state
      this.ctx.putImageData(previousState, 0, 0);
    }
  }

  render() {
    return html`
      <div class="container" style="transform: scale(${this.scale})">
        ${this.backgroundImage
          ? html`<img
              src="${this.backgroundImage}"
              width="${this.width}"
              height="${this.height}"
            />`
          : ''}
        <canvas
          width="${this.width}"
          height="${this.height}"
          @mousedown=${this.handleMouseDown}
          @mouseup=${this.handleMouseUp}
          @mousemove=${this.handleMouseMove}
          @mouseleave=${this.handleMouseLeave}
          @mouseenter=${this.handleMouseEnter}
        ></canvas>
      </div>
    `;
  }
}

customElements.define('image-canvas', ImageCanvas);
