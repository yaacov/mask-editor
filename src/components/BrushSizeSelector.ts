import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class BrushSizeSelector extends LitElement {
  @property({ type: Number }) value = 10;

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
    input[type='range'] {
      width: 100px;
      height: 4px;
      border-radius: 2px;
      -webkit-appearance: none;
      background: #ddd;
    }
    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #666;
      cursor: pointer;
    }
  `;

  handleInput(e: Event) {
    this.value = (e.target as HTMLInputElement).valueAsNumber;
    this.dispatchEvent(
      new CustomEvent('brush-size-changed', { detail: this.value })
    );
  }

  render() {
    return html`
      <label>
        Brush Size:
        <input
          type="range"
          min="1"
          max="64"
          .value=${this.value}
          @input=${this.handleInput}
        />
      </label>
    `;
  }
}

customElements.define('brush-size-selector', BrushSizeSelector);
