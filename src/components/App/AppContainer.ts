import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import '../Toolbar/ImageToolbar';
import '../Editor/ImageCanvas';

interface WindowPosition {
  top: number;
  left: number;
}

export class AppContainer extends LitElement {
  @property({ type: Number }) brushSize = 8;
  @property({ type: String }) onColor = '#ffff00';
  @property({ type: Number }) alpha = 0.5;
  @property({ type: String }) mode = 'draw'; // Add this line
  @property({ type: Number }) scale = 0.5; // Add this line
  @state() private imageWidth = 0;
  @state() private imageHeight = 0;
  @state() private currentImage: string = '';
  @state() private currentMask: string = '';
  @state() private suggestedFilename: string = '';
  @state() private windowWidth = 800;
  @state() private windowHeight = 600;
  @state() private isResizing = false;
  @state() private resizeStartX = 0;
  @state() private resizeStartY = 0;
  @state() private resizeStartWidth = 0;
  @state() private resizeStartHeight = 0;
  @state() private isDragging = false;
  @state() private dragOffset = { x: 0, y: 0 };

  static styles = css`
    :host {
      display: block;
      margin: 10px auto;
      --window-width: 800px;
      --window-height: 600px;
      --window-top: 80px;
      --window-left: 20px;
    }

    image-toolbar {
      z-index: 1000;
      background-color: #f5f5f5;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 10px;
    }

    .window-container {
      position: absolute;
      top: var(--window-top);
      left: var(--window-left);
      width: var(--window-width);
      height: var(--window-height);
      margin: 0;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      resize: both;
      overflow: hidden;
      z-index: 100;
    }

    .window-title {
      background-color: #f5f5f5;
      padding: 8px;
      border-bottom: 1px solid #ccc;
      font-size: 14px;
      font-weight: bold;
      cursor: move;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Oxygen, Ubuntu, sans-serif;
    }

    .window-content {
      flex: 1;
      overflow: auto;
      position: relative;
    }

    image-canvas {
      position: relative;
      z-index: 1;
    }

    .resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 16px;
      height: 16px;
      cursor: se-resize;
      background-color: #ccc;
    }

    .resize-handle:hover {
      background-color: #999;
    }

    :host([resizing]) {
      cursor: se-resize;
      user-select: none;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadImageDimensions(this.currentImage);
    this.setupResizeObserver();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private resizeObserver: ResizeObserver | null = null;

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.classList.contains('window-container')) {
          const container = entry.target as HTMLElement;
          // Update CSS variables directly instead of component properties
          container.style.setProperty(
            '--window-width',
            `${entry.contentRect.width}px`
          );
          container.style.setProperty(
            '--window-height',
            `${entry.contentRect.height}px`
          );
        }
      }
    });

    const container = this.renderRoot.querySelector('.window-container');
    if (container) {
      this.resizeObserver.observe(container);
    }
  }

  private async loadImageDimensions(imageUrl: string) {
    if (!imageUrl) return;

    const img = new Image();
    img.src = imageUrl;
    await img.decode();

    this.imageWidth = img.naturalWidth;
    this.imageHeight = img.naturalHeight;

    // Calculate scaled dimensions with padding
    const scaledWidth = Math.round(this.imageWidth * this.scale) + 40;
    const scaledHeight = Math.round(this.imageHeight * this.scale) + 80;

    // Update window dimensions
    this.windowWidth = scaledWidth;
    this.windowHeight = scaledHeight;

    // Reset position to initial values
    const newPosition = {
      left: 20,
      top: 80,
    };

    // Update position and size using both CSS variables and properties
    this.updatePosition(newPosition);

    // Update the window container element directly
    const container = this.renderRoot?.querySelector('.window-container');
    if (container) {
      (container as HTMLElement).style.width = `${scaledWidth}px`;
      (container as HTMLElement).style.height = `${scaledHeight}px`;
    }

    // Update CSS custom properties
    this.style.setProperty('--window-width', `${scaledWidth}px`);
    this.style.setProperty('--window-height', `${scaledHeight}px`);

    this.requestUpdate();
  }

  handleBrushSizeUpdated(e: CustomEvent) {
    this.brushSize = e.detail;
    this.requestUpdate();
  }

  handleColorUpdated(e: CustomEvent) {
    this.onColor = e.detail;
    this.requestUpdate();
  }

  handleAlphaUpdated(e: CustomEvent) {
    this.alpha = e.detail;
    this.requestUpdate();
  }

  handleModeUpdated(e: CustomEvent) {
    this.mode = e.detail;
    this.requestUpdate();
  }

  handleScaleUpdated(e: CustomEvent) {
    this.scale = e.detail;
    if (this.currentImage) {
      this.loadImageDimensions(this.currentImage);
    }
    this.requestUpdate();
  }

  handleImageUpload(e: CustomEvent) {
    this.suggestedFilename = e.detail.filename || '';
    this.currentImage = e.detail.imageData;
    this.loadImageDimensions(e.detail.imageData);
    this.requestUpdate();
  }

  handleMaskUpload(e: CustomEvent) {
    this.currentMask = e.detail.imageData;
    this.requestUpdate();
  }

  handleSaveRequest() {
    const canvas = this.renderRoot.querySelector('image-canvas');
    if (canvas) {
      (canvas as any).saveImage();
    }
  }

  handleClearMask() {
    const canvas = this.renderRoot.querySelector('image-canvas');
    if (canvas) {
      (canvas as any).clearCanvas();
    }
  }

  handleResetMask() {
    const canvas = this.renderRoot.querySelector('image-canvas');
    if (canvas) {
      (canvas as any).redrawMask();
    }
  }

  private handleResizeStart(e: MouseEvent) {
    this.isResizing = true;
    document.body.style.cursor = 'se-resize';
    this.resizeStartX = e.clientX;
    this.resizeStartY = e.clientY;
    this.resizeStartWidth = this.windowWidth;
    this.resizeStartHeight = this.windowHeight;

    document.addEventListener('mousemove', this.handleResizeMove.bind(this));
    document.addEventListener('mouseup', this.handleResizeEnd.bind(this));
  }

  private handleResizeMove(e: MouseEvent) {
    if (!this.isResizing) return;

    const deltaX = e.clientX - this.resizeStartX;
    const deltaY = e.clientY - this.resizeStartY;

    const newWidth = Math.max(400, this.resizeStartWidth + deltaX);
    const newHeight = Math.max(300, this.resizeStartHeight + deltaY);

    this.style.setProperty('--window-width', `${newWidth}px`);
    this.style.setProperty('--window-height', `${newHeight}px`);
    this.windowWidth = newWidth;
    this.windowHeight = newHeight;
  }

  private handleResizeEnd() {
    this.isResizing = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.handleResizeMove.bind(this));
    document.removeEventListener('mouseup', this.handleResizeEnd.bind(this));
  }

  private calculateBoundedPosition(x: number, y: number): WindowPosition {
    // Ensure minimum visible area (100px) remains on screen
    const minVisible = 100;
    const maxLeft = Math.max(0, window.innerWidth - minVisible);
    const maxTop = Math.max(0, window.innerHeight - minVisible);

    return {
      left: Math.min(maxLeft, Math.max(-this.windowWidth + minVisible, x)),
      top: Math.min(maxTop, Math.max(-this.windowHeight + minVisible, y)),
    };
  }

  private handleDragStart(e: MouseEvent) {
    if (e.target !== this.renderRoot?.querySelector('.window-title')) return;

    this.isDragging = true;
    document.body.style.cursor = 'move';

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Use capture phase to prevent text selection during drag
    document.addEventListener(
      'mousemove',
      this.handleDragMove.bind(this),
      true
    );
    document.addEventListener('mouseup', this.handleDragEnd.bind(this), true);

    e.preventDefault();
  }

  private handleDragMove(e: MouseEvent) {
    if (!this.isDragging) return;

    const newPosition = this.calculateBoundedPosition(
      e.clientX - this.dragOffset.x,
      e.clientY - this.dragOffset.y
    );

    this.updatePosition(newPosition);
    this.requestUpdate();
  }

  private handleDragEnd() {
    this.isDragging = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.handleDragMove.bind(this));
    document.removeEventListener('mouseup', this.handleDragEnd.bind(this));
  }

  private updatePosition(position: WindowPosition) {
    this.style.setProperty('--window-top', `${position.top}px`);
    this.style.setProperty('--window-left', `${position.left}px`);
  }

  render() {
    return html`
      <image-toolbar
        .initiaBrashSize=${this.brushSize}
        .initialColor=${this.onColor}
        .initialAlpha=${this.alpha}
        .initialScale=${this.scale}
        @brush-size-updated=${this.handleBrushSizeUpdated}
        @color-updated=${this.handleColorUpdated}
        @alpha-updated=${this.handleAlphaUpdated}
        @mode-change=${this.handleModeUpdated}
        @scale-updated=${this.handleScaleUpdated}
        @image-upload=${this.handleImageUpload}
        @mask-upload=${this.handleMaskUpload}
        @save-request=${this.handleSaveRequest}
        @clear-mask=${this.handleClearMask}
        @reset-mask=${this.handleResetMask}
      ></image-toolbar>
      <div class="window-container">
        <div class="window-title" @mousedown=${this.handleDragStart}>
          ${this.suggestedFilename || 'No image loaded'}
        </div>
        <div class="window-content">
          <image-canvas
            brushSize=${this.brushSize}
            onColor=${this.onColor}
            alpha=${this.alpha}
            mode=${this.mode}
            scale=${this.scale}
            .backgroundImage=${this.currentImage}
            .image=${this.currentMask}
            .suggestedFilename=${this.suggestedFilename}
            .width=${this.imageWidth}
            .height=${this.imageHeight}
          ></image-canvas>
        </div>
        <div class="resize-handle" @mousedown=${this.handleResizeStart}></div>
      </div>
    `;
  }
}

customElements.define('app-container', AppContainer);
