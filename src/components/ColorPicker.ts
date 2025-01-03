import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class ColorPicker extends LitElement {
  @property({ type: String }) value = '#000000';

  private colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#000000'];

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
    .color-buttons {
      display: flex;
      gap: 8px;
    }
    .color-button {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    .color-button.selected {
      outline: 2px solid #666;
      outline-offset: 2px;
    }
  `;

  handleColorClick(color: string) {
    this.value = color;
    this.dispatchEvent(
      new CustomEvent('color-changed', { detail: this.value })
    );
  }

  render() {
    return html`
      <label>
        Color:
        <div class="color-buttons">
          ${this.colors.map(
            (color) => html`
              <button
                class="color-button ${color === this.value ? 'selected' : ''}"
                style="background-color: ${color}"
                @click=${() => this.handleColorClick(color)}
              ></button>
            `
          )}
        </div>
      </label>
    `;
  }
}

customElements.define('color-picker', ColorPicker);
