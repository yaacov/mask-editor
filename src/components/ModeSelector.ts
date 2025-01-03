import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class ModeSelector extends LitElement {
  @property({ type: String }) mode: 'draw' | 'delete' = 'draw';

  static styles = css`
    :host {
      display: flex;
      align-items: center;
    }
    .mode-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .mode-button:hover {
      background: #f0f0f0;
    }
    .mode-button.active {
      outline: 2px solid #666;
      outline-offset: 2px;
    }
  `;

  render() {
    return html`
      <button
        class="mode-button ${this.mode === 'delete' ? 'active' : ''}"
        @click=${this.handleClick}
      >
        ❌
      </button>
    `;
  }

  private handleClick() {
    const newMode = this.mode === 'draw' ? 'delete' : 'draw';
    this.dispatchEvent(new CustomEvent('mode-changed', { detail: newMode }));
  }
}

customElements.define('mode-selector', ModeSelector);
