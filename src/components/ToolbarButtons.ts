import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class ToolbarButtons extends LitElement {
  @property({ type: String }) imageFileName = '';
  @property({ type: String }) maskFileName = '';

  static styles = css`
    .toolbar {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    input[type='file'] {
      display: none;
    }
    .button {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid #007bff;
      color: #007bff;
      background: transparent;
    }
    .button:hover {
      background: #f0f8ff;
    }
    .button.primary {
      background: #007bff;
      color: white;
      border: none;
    }
    .button.primary:hover {
      background: #0056b3;
    }
    .button.danger {
      color: #dc3545;
      border-color: #dc3545;
    }
    .button.danger:hover {
      background: #fff5f5;
    }
  `;

  render() {
    return html`
      <div class="toolbar">
        <button class="button danger" @click=${this.handleClearClick}>
          Clear Mask
        </button>
        <button class="button danger" @click=${this.handleResetClick}>
          Reset Mask
        </button>
        <input
          type="file"
          id="imageFileInput"
          accept="image/*"
          @change=${(e: Event) => this.handleFileSelect(e, 'image')}
        />
        <input
          type="file"
          id="maskFileInput"
          accept="image/*"
          @change=${(e: Event) => this.handleFileSelect(e, 'mask')}
        />
        <button class="button" @click=${() => this.handleUploadClick('image')}>
          Upload Image
        </button>
        <button class="button" @click=${() => this.handleUploadClick('mask')}>
          Upload Mask
        </button>
        <button class="button primary" @click=${this.handleSaveClick}>
          Save Mask
        </button>
      </div>
    `;
  }

  private handleFileSelect(event: Event, type: 'image' | 'mask') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (type === 'image') {
        this.imageFileName = file.name;
      } else {
        this.maskFileName = file.name;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          this.dispatchEvent(
            new CustomEvent(`${type}-upload`, {
              detail: {
                imageData: result,
                filename: file.name.split('.')[0],
              },
              bubbles: true,
              composed: true,
            })
          );
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private handleSaveClick() {
    this.dispatchEvent(
      new CustomEvent('save-request', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleUploadClick(type: 'image' | 'mask') {
    const input = this.renderRoot.querySelector(
      `#${type}FileInput`
    ) as HTMLInputElement;
    input.click();
  }

  private handleClearClick() {
    this.dispatchEvent(
      new CustomEvent('clear-mask', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleResetClick() {
    this.dispatchEvent(
      new CustomEvent('reset-mask', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('toolbar-buttons', ToolbarButtons);
