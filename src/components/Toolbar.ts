import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

import './BrushSizeSelector';
import './ColorPicker';
import './AlphaSelector';
import './ModeSelector';
import './ScaleSelector';
import './ToolbarButtons';

export class ToolbarComponent extends LitElement {
  @property({ type: Number }) brushSize = 10;
  @property({ type: String }) onColor = '#ff0000';
  @property({ type: Number }) alpha = 0.5;
  @property({ type: String }) mode: 'draw' | 'delete' = 'draw';
  @property({ type: Number }) scale = 0.5;
  @property({ type: String }) imageFileName = '';
  @property({ type: String }) maskFileName = '';

  @property({ type: String }) initialColor = '#ff0000';
  @property({ type: Number }) initialAlpha = 0.5;
  @property({ type: Number }) initialScale = 0.5;

  static styles = css`
    :host {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    div {
      display: flex;
      align-items: center;
      gap: 20px;
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
  }

  render() {
    return html`
      <div>
        <brush-size-selector
          .brushSize=${this.brushSize}
          @brush-size-changed=${this.handleBrushSizeChanged}
        ></brush-size-selector>
        <color-picker
          .value=${this.onColor}
          @color-changed=${this.handleColorChanged}
        ></color-picker>
        <mode-selector
          .mode=${this.mode}
          @mode-changed=${this.handleModeChange}
        ></mode-selector>
        <alpha-selector
          .alpha=${this.alpha}
          @alpha-changed=${this.handleAlphaChanged}
        ></alpha-selector>
        <scale-selector
          .scale=${this.scale}
          @scale-changed=${this.handleScaleChanged}
        ></scale-selector>
        <toolbar-buttons></toolbar-buttons>
      </div>
    `;
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

customElements.define('toolbar-component', ToolbarComponent);
