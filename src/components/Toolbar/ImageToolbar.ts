import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

import '../Inputs/BrushSizeSelector';
import '../Inputs/ColorPicker';
import '../Inputs/AlphaSelector';
import '../Inputs/ModeSelector';
import '../Inputs/ScaleSelector';
import './ToolbarButtons';

export class ImageToolbar extends LitElement {
  @property({ type: Number }) brushSize = 8;
  @property({ type: String }) onColor = '#ff0000';
  @property({ type: Number }) alpha = 0.5;
  @property({ type: String }) mode: 'draw' | 'delete' = 'draw';
  @property({ type: Number }) scale = 0.5;
  @property({ type: String }) imageFileName = '';
  @property({ type: String }) maskFileName = '';

  @property({ type: String }) initialColor = '#ff0000';
  @property({ type: Number }) initialAlpha = 0.5;
  @property({ type: Number }) initialScale = 0.5;
  @property({ type: Number }) initiaBrashSize = 8;

  @property({ type: Number }) posX = 2;
  @property({ type: Number }) posY = 2;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  // Add bound event handlers
  private boundHandleDragMove = this.handleDragMove.bind(this);
  private boundHandleDragEnd = this.handleDragEnd.bind(this);

  static styles = css`
    :host {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
      position: fixed;
      width: fit-content;
      transform: translate(var(--toolbar-left, 0px), var(--toolbar-top, 0px));
      cursor: grab;
      background: white;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    :host(.dragging) {
      cursor: grabbing;
    }
    div {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .divider {
      height: 24px;
      width: 1px;
      background-color: #ccc;
      margin: 0 5px;
    }
    .alpha-slider {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .mode-button {
      padding: 5px 10px;
      margin: 5px;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    .mode-button.active {
      background: #e0e0e0;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.onColor = this.initialColor;
    this.alpha = this.initialAlpha;
    this.scale = this.initialScale;
    this.brushSize = this.initiaBrashSize;

    // Initialize position CSS vars
    this.style.setProperty('--toolbar-left', `${this.posX}px`);
    this.style.setProperty('--toolbar-top', `${this.posY}px`);
  }

  render() {
    return html`
      <div
        @mousedown=${this.handleDragStart}
        @touchstart=${this.handleDragStart}
      >
        <brush-size-selector
          .brushSize=${this.brushSize}
          @brush-size-changed=${this.handleBrushSizeChanged}
        ></brush-size-selector>
        <div class="divider"></div>
        <color-picker
          .value=${this.onColor}
          @color-changed=${this.handleColorChanged}
        ></color-picker>
        <div class="divider"></div>
        <mode-selector
          .mode=${this.mode}
          @mode-changed=${this.handleModeChange}
        ></mode-selector>
        <div class="divider"></div>
        <alpha-selector
          .alpha=${this.alpha}
          @alpha-changed=${this.handleAlphaChanged}
        ></alpha-selector>
        <div class="divider"></div>
        <scale-selector
          .scale=${this.scale}
          @scale-changed=${this.handleScaleChanged}
        ></scale-selector>
        <div class="divider"></div>
        <toolbar-buttons></toolbar-buttons>
      </div>
    `;
  }

  handleDragStart(e: MouseEvent | TouchEvent) {
    const event = 'touches' in e ? e.touches[0] : e;
    this.isDragging = true;
    this.classList.add('dragging');
    this.dragStartX = event.clientX - this.posX;
    this.dragStartY = event.clientY - this.posY;

    window.addEventListener('mousemove', this.boundHandleDragMove, {
      passive: false,
    });
    window.addEventListener('touchmove', this.boundHandleDragMove, {
      passive: false,
    });
    window.addEventListener('mouseup', this.boundHandleDragEnd);
    window.addEventListener('touchend', this.boundHandleDragEnd);
  }

  handleDragMove(e: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    e.preventDefault(); // Prevent scrolling on touch devices
    const event = 'touches' in e ? e.touches[0] : e;

    const newX = event.clientX - this.dragStartX;
    const newY = event.clientY - this.dragStartY;

    // Ensure toolbar stays within viewport
    this.posX = Math.max(
      0,
      Math.min(window.innerWidth - this.clientWidth, newX)
    );
    this.posY = Math.max(
      0,
      Math.min(window.innerHeight - this.clientHeight, newY)
    );

    this.style.setProperty('--toolbar-left', `${this.posX}px`);
    this.style.setProperty('--toolbar-top', `${this.posY}px`);
  }

  handleDragEnd() {
    this.isDragging = false;
    this.classList.remove('dragging');

    // Remove event listeners using bound handlers
    window.removeEventListener('mousemove', this.boundHandleDragMove);
    window.removeEventListener('touchmove', this.boundHandleDragMove);
    window.removeEventListener('mouseup', this.boundHandleDragEnd);
    window.removeEventListener('touchend', this.boundHandleDragEnd);
  }

  handleModeChange(e: CustomEvent) {
    this.mode = e.detail;
    this.dispatchEvent(new CustomEvent('mode-change', { detail: this.mode }));
  }

  handleBrushSizeChanged(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('brush-size-updated', { detail: e.detail })
    );
  }

  handleColorChanged(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('color-updated', { detail: e.detail }));
  }

  handleAlphaChanged(e: CustomEvent) {
    this.alpha = e.detail;
    this.dispatchEvent(
      new CustomEvent('alpha-updated', { detail: this.alpha })
    );
  }

  handleScaleChanged(e: CustomEvent) {
    this.scale = e.detail;
    this.dispatchEvent(
      new CustomEvent('scale-updated', { detail: this.scale })
    );
  }
}

customElements.define('image-toolbar', ImageToolbar);
