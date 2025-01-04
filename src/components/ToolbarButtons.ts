import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

export class ToolbarButtons extends LitElement {
  @property({ type: String }) imageFileName = '';
  @property({ type: String }) maskFileName = '';
  @state() private isDropdownOpen = false;

  static styles = css`
    .toolbar {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .kebab-button {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 3px;
      align-items: center;
      border-radius: 4px;
    }

    .kebab-button:hover {
      background: #f5f5f5;
    }

    .kebab-dot {
      width: 4px;
      height: 4px;
      background: #333;
      border-radius: 50%;
    }

    .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      display: none;
      z-index: 1000;
    }

    .dropdown.open {
      display: block;
    }

    .dropdown-item {
      padding: 8px 16px;
      cursor: pointer;
      white-space: nowrap;
      display: block;
      width: 100%;
      text-align: left;
      border: none;
      background: none;
      color: #333;
    }

    .dropdown-item:hover {
      background: #f5f5f5;
    }

    input[type='file'] {
      display: none;
    }

    .dropdown-separator {
      height: 1px;
      background-color: #ddd;
      margin: 4px 0;
    }

    .upload-button {
      background: white;
      border: 1px solid #ddd;
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      border-radius: 4px;
    }

    .upload-button:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }
  `;

  render() {
    return html`
      <div class="toolbar">
        <button
          class="upload-button"
          @click=${() => this.handleUploadClick('image')}
        >
          Upload Image
        </button>
        <button class="kebab-button" @click=${this.toggleDropdown}>
          <div class="kebab-dot"></div>
          <div class="kebab-dot"></div>
          <div class="kebab-dot"></div>
        </button>

        <div class="dropdown ${this.isDropdownOpen ? 'open' : ''}">
          <button
            class="dropdown-item"
            @click=${() => this.handleUploadClick('image')}
          >
            Upload Image
          </button>
          <button
            class="dropdown-item"
            @click=${() => this.handleUploadClick('mask')}
          >
            Upload Mask
          </button>
          <div class="dropdown-separator"></div>

          <button class="dropdown-item" @click=${this.handleClearClick}>
            Clear Mask
          </button>
          <button class="dropdown-item" @click=${this.handleResetClick}>
            Reset Mask
          </button>
          <div class="dropdown-separator"></div>

          <button class="dropdown-item" @click=${this.handleSaveClick}>
            Save Mask
          </button>
        </div>

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
      </div>
    `;
  }

  private toggleDropdown = (e: Event) => {
    e.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen) {
      // Add click outside listener
      setTimeout(() => {
        window.addEventListener('click', this.closeDropdown);
      }, 0);
    }
  };

  private closeDropdown = () => {
    this.isDropdownOpen = false;
    window.removeEventListener('click', this.closeDropdown);
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('click', this.closeDropdown);
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
