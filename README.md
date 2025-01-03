# Mask Editor

A web-based image mask editor built with Lit Elements and TypeScript. This tool allows users to create, edit, and modify image masks.

Masks are binary or grayscale images that define which pixels belong to the foreground (region of interest) and which belong to the background, making them invaluable for both automated processing and human analysis.

## Use Cases

Image masks are essential tools in various fields:

- **Machine Learning & AI**: Creating training data for image segmentation models
- **Computer Vision**: Defining regions of interest for object detection
- **Image Processing**: Isolating specific areas for selective editing or analysis
- **Medical Imaging**: Annotating medical images to highlight areas of interest
- **Geographic Information Systems (GIS)**: Marking specific regions on satellite imagery
- **Quality Control**: Highlighting defects or areas requiring inspection

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yaacov/mask-editor.git
cd mask-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

1. Upload an image using the "Upload Image" button
2. Upload an existing mask or create a new one
3. Use the toolbar to:
   - Adjust brush size
   - Change mask color
   - Modify opacity
   - Switch between draw/erase modes
   - Adjust zoom level
4. Draw or edit the mask as needed
5. Save your work using the save button

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code using Prettier

## License

MIT License
