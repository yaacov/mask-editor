import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class ModeSelector extends LitElement {
  @property({ type: String }) mode: 'draw' | 'delete' | 'fill' | 'line' =
    'draw';

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
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
      background: #e0e0e0;
      outline: 2px solid #666;
      outline-offset: 2px;
    }
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 20px;
      color: #333;
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
    }
  `;

  render() {
    return html`
      <button
        class="mode-button ${this.mode === 'draw' ? 'active' : ''}"
        @click=${() => this.handleClick('draw')}
        title="Draw"
      >
        <span class="material-icons">gesture</span>
      </button>
      <button
        class="mode-button ${this.mode === 'line' ? 'active' : ''}"
        @click=${() => this.handleClick('line')}
        title="Line"
      >
        <span class="material-icons">show_chart</span>
      </button>
      <button
        class="mode-button ${this.mode === 'fill' ? 'active' : ''}"
        @click=${() => this.handleClick('fill')}
        title="Fill"
      >
        <span class="material-icons">format_color_fill</span>
      </button>
      <button
        class="mode-button ${this.mode === 'delete' ? 'active' : ''}"
        @click=${() => this.handleClick('delete')}
        title="Erase"
      >
        <span class="material-icons">close</span>
      </button>
    `;
  }

  private handleClick(newMode: 'draw' | 'delete' | 'fill' | 'line') {
    this.dispatchEvent(new CustomEvent('mode-changed', { detail: newMode }));
  }
}

customElements.define('mode-selector', ModeSelector);
