import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class AlphaSelector extends LitElement {
  @property({ type: Number }) alpha = 1.0;

  private alphaValues = [0.25, 0.5, 0.75, 1.0];

  static styles = css`
    :host {
      display: flex;
      align-items: center;
    }
    .alpha-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alpha-button {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      position: relative;
      background: white;
    }
    .alpha-button.selected {
      outline: 2px solid #666;
      outline-offset: 2px;
    }
    .alpha-fill {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #666;
      border-radius: 3px;
    }
  `;

  private handleAlphaClick(value: number) {
    this.alpha = value;
    this.dispatchEvent(new CustomEvent('alpha-changed', { detail: value }));
  }

  render() {
    return html`
      <div class="alpha-buttons">
        <label>Opacity:</label>
        ${this.alphaValues.map(
          (value) => html`
            <button
              class="alpha-button ${value === this.alpha ? 'selected' : ''}"
              @click=${() => this.handleAlphaClick(value)}
            >
              <div class="alpha-fill" style="opacity: ${value}"></div>
            </button>
          `
        )}
      </div>
    `;
  }
}

customElements.define('alpha-selector', AlphaSelector);
