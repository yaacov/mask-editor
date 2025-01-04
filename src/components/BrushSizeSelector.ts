import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class BrushSizeSelector extends LitElement {
  @property({ type: Number }) brushSize = 8;

  private sizes = [8, 16, 32, 64];
  private iconSizes = [2, 4, 6, 8];

  static styles = css`
    :host {
      display: flex;
      align-items: center;
    }
    label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .size-buttons {
      display: flex;
      gap: 8px;
    }
    .size-button {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
    }
    .size-button.selected {
      outline: 2px solid #666;
      outline-offset: 2px;
    }
    .line {
      width: 20px;
      background: #000;
    }
  `;

  handleSizeClick(size: number) {
    this.brushSize = size;
    this.dispatchEvent(
      new CustomEvent('brush-size-changed', { detail: this.brushSize })
    );
  }

  render() {
    return html`
      <div class="size-buttons">
        ${this.sizes.map(
          (size, index) => html`
            <button
              class="size-button ${size === this.brushSize ? 'selected' : ''}"
              @click=${() => this.handleSizeClick(size)}
              title="${size}px"
            >
              <div
                class="line"
                style="height: ${this.iconSizes[index]}px"
              ></div>
            </button>
          `
        )}
      </div>
    `;
  }
}

customElements.define('brush-size-selector', BrushSizeSelector);
