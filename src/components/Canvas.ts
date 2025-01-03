import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class CanvasComponent extends LitElement {
  @property({ type: Number }) brushSize = 10;
  @property({ type: String }) onColor = '#000000';
  @property({ type: Boolean }) isDrawing = false;
  @property({ type: Number }) width = 600;
  @property({ type: Number }) height = 500;
  @property({ type: String }) backgroundImage = '';
  @property({ type: Number }) alpha = 1.0;
  @property({ type: String }) mode: 'draw' | 'delete' = 'draw';
  @property({ type: String }) image = '';
  @property({ type: String }) private filename = 'mask-image';
  @property({ type: Number }) scale = 1.0;
  @property({ type: String }) suggestedFilename = '';

  private ctx: CanvasRenderingContext2D | null = null;
  private lastX: number = 0;
  private lastY: number = 0;
  private history: ImageData[] = [];
  private maxHistoryLength = 10; // Limit history to prevent memory issues

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

    // Add keyboard event listener for Ctrl+Z
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') {
        this.undo();
      }
    });
  }

  private loadBackgroundImage() {
    if (!this.backgroundImage) return;

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

    // Handle filename extraction
    if (this.image.startsWith('data:')) {
      // For base64 data URLs, use suggested name or default
      this.filename = this.suggestedFilename || 'mask-image';
    } else {
      // For regular URLs, extract filename
      const urlParts = this.image.split('/');
      const fullFilename = urlParts[urlParts.length - 1];
      this.filename = fullFilename.split('.')[0]; // Remove extension
    }

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
          const data = imageData.data;

          // Process each pixel
          for (let i = 0; i < data.length; i += 4) {
            // If the pixel has any color
            if (data[i] > 125) {
              data[i] =
                this.onColor.length === 7
                  ? parseInt(this.onColor.slice(1, 3), 16)
                  : 0; // R
              data[i + 1] =
                this.onColor.length === 7
                  ? parseInt(this.onColor.slice(3, 5), 16)
                  : 0; // G
              data[i + 2] =
                this.onColor.length === 7
                  ? parseInt(this.onColor.slice(5, 7), 16)
                  : 0; // B
              data[i + 3] = 255; // A (fully opaque)
            } else {
              // If pixel is black, make it transparent
              data[i + 3] = 0; // A (fully transparent)
            }
          }

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
    // Save the current state before starting a new stroke
    this.saveToHistory();

    this.isDrawing = true;
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    canvas?.classList.add(this.mode === 'draw' ? 'drawing' : 'deleting');
    const rect = canvas.getBoundingClientRect();
    // Adjust coordinates for scale
    this.lastX = e.clientX / this.scale - rect.left / this.scale;
    this.lastY = e.clientY / this.scale - rect.top / this.scale;

    if (this.ctx) {
      // Change the composite operation based on mode
      this.ctx.globalCompositeOperation =
        this.mode === 'draw' ? 'source-over' : 'destination-out';
    }
  }

  handleMouseUp() {
    this.isDrawing = false;
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    canvas?.classList.remove('drawing');
    canvas?.classList.remove('deleting');
    this.ctx?.beginPath();
  }

  handleMouseMove(e: MouseEvent) {
    if (!this.isDrawing || !this.ctx) return;

    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    // Adjust coordinates for scale
    const currentX = e.clientX / this.scale - rect.left / this.scale;
    const currentY = e.clientY / this.scale - rect.top / this.scale;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    // In delete mode, we use black color but with 'destination-out' composite operation
    this.ctx.strokeStyle = this.mode === 'draw' ? this.onColor : '#000000';
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    this.lastX = currentX;
    this.lastY = currentY;
  }

  handleMouseLeave() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    canvas?.classList.remove('drawing');
    canvas?.classList.remove('deleting');
    this.isDrawing = false;
    this.ctx?.beginPath();
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
      const data = imageData.data;

      // Convert to black and white based on alpha
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        // If pixel has any opacity, make it white (255), otherwise black (0)
        const value = alpha > 0 ? 255 : 0;
        data[i] = value; // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = value; // A (fully opaque)
      }

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

customElements.define('image-canvas', CanvasComponent);
