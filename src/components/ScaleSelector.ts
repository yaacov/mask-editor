import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class ScaleSelector extends LitElement {
  @property({ type: Number }) scale = 1;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
    }
    label {
      margin-right: 8px;
    }
    select {
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
    }
  `;

  render() {
    return html`
      <select
        id="scale-select"
        title="Select zoom level"
        @change=${this.handleChange}
        .value=${this.scale.toString()}
      >
        <option value="0.25">25%</option>
        <option value="0.5">50%</option>
        <option value="0.75">75%</option>
        <option value="1">100%</option>
      </select>
    `;
  }

  private handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const newScale = parseFloat(select.value);
    this.dispatchEvent(new CustomEvent('scale-changed', { detail: newScale }));
  }
}

customElements.define('scale-selector', ScaleSelector);
