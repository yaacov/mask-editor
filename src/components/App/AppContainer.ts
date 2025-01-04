import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import '../Toolbar/ImageToolbar';
import '../Editor/ImageCanvas';

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

  static styles = css`
    :host {
      display: block;
      margin: 10px auto;
    }

    image-toolbar {
      z-index: 1000;
      background-color: #f5f5f5;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 10px;
    }

    image-canvas {
      position: relative;
      padding-top: 50px;
      z-index: 1;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadImageDimensions();
  }

  private async loadImageDimensions() {
    const img = new Image();
    img.src = '';
    await img.decode();

    this.imageWidth = img.naturalWidth;
    this.imageHeight = img.naturalHeight;
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
    this.requestUpdate();
  }

  handleImageUpload(e: CustomEvent) {
    this.suggestedFilename = e.detail.filename || '';
    this.currentImage = e.detail.imageData;
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
    `;
  }
}

customElements.define('app-container', AppContainer);