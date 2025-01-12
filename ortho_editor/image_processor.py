import numpy as np
from PyQt5.QtGui import QImage
from skimage.filters import gaussian
from skimage.morphology import thin
from .image_utils import ImageUtils


class ImageProcessor:
    @staticmethod
    def smooth_image(image, pen_color):
        """Apply Gaussian smoothing to the image"""
        if not image:
            return None

        # Convert to numpy array
        image_array = ImageUtils.qimage_to_numpy(image)

        # Create binary mask based on alpha channel (1 where alpha > 0)
        mask = (image_array[:, :, 3] > 0).astype(np.float32)

        # Apply Gaussian smoothing to the mask
        smoothed_mask = gaussian(mask, sigma=1)

        # Create new RGBA array
        height, width = mask.shape
        result = np.zeros((height, width, 4), dtype=np.uint8)

        # Where smoothed mask > 0, set the color and alpha
        mask_threshold = smoothed_mask > 0.1
        result[mask_threshold] = [
            pen_color.red(),
            pen_color.green(),
            pen_color.blue(),
            255,
        ]

        # Convert back to QImage and update
        return QImage(
            result.data, width, height, width * 4, QImage.Format_RGBA8888
        ).copy()

    @staticmethod
    def thin_image(image, pen_color):
        """Apply thinning to the image"""
        if not image:
            return None

        # Convert to numpy array
        image_array = ImageUtils.qimage_to_numpy(image)

        # Create binary mask based on alpha channel
        mask = (image_array[:, :, 3] > 0).astype(np.uint8)

        # Apply thinning
        thinned_mask = thin(mask)

        # Create new RGBA array
        height, width = mask.shape
        result = np.zeros((height, width, 4), dtype=np.uint8)

        # Where thinned mask is True, set the color and alpha
        result[thinned_mask] = [
            pen_color.red(),
            pen_color.green(),
            pen_color.blue(),
            255,
        ]

        # Convert back to QImage
        return QImage(
            result.data, width, height, width * 4, QImage.Format_RGBA8888
        ).copy()

    @staticmethod
    def create_binary_save_image(image):
        """Convert image to binary (black and white) for saving"""
        if not image:
            return None

        # Convert to numpy array
        image_array = ImageUtils.qimage_to_numpy(image)

        # Create a new image where alpha > 0 becomes white (255,255,255) and alpha = 0 becomes black (0,0,0)
        bw_array = np.zeros(
            (image_array.shape[0], image_array.shape[1], 3), dtype=np.uint8
        )
        bw_array[image_array[:, :, 3] > 0] = [255, 255, 255]

        # Convert back to QImage
        return QImage(
            bw_array.data,
            bw_array.shape[1],
            bw_array.shape[0],
            bw_array.shape[1] * 3,
            QImage.Format_RGB888,
        )

    @staticmethod
    def smooth_thin_smooth_image(image, pen_color):
        """Apply smooth-thin-smooth filter to the image"""
        if not image:
            return None

        # First smoothing
        for _ in range(2):
            image = ImageProcessor.smooth_image(image, pen_color)

        # Thinning
        image = ImageProcessor.thin_image(image, pen_color)

        # More smoothing passes
        for _ in range(4):
            image = ImageProcessor.smooth_image(image, pen_color)

        return image

    @staticmethod
    def flood_fill(image, start_point, fill_color):
        """Perform flood fill on the image starting from the given point"""
        if not image:
            return None

        # Make a copy of the original image
        result = image.copy()

        # Convert to numpy array just for the fill mask calculation
        image_array = ImageUtils.qimage_to_numpy(image)
        height, width = image_array.shape[:2]
        x, y = int(start_point.x()), int(start_point.y())

        # Bounds check
        if x < 0 or x >= width or y < 0 or y >= height:
            return image

        # Get target color (what we're replacing)
        target_alpha = image_array[y, x, 3]
        fill_alpha = fill_color.alpha()

        # If clicking on a pixel with the same transparency as fill color, return
        if (target_alpha > 0) == (fill_alpha > 0):
            return image

        # Create a mask for the fill area
        fill_mask = np.zeros((height, width), dtype=bool)

        # Stack for flood fill
        stack = [(x, y)]
        fill_mask[y, x] = True

        # Directions for 4-connected fill
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]

        while stack:
            cx, cy = stack.pop()

            # Check neighboring pixels
            for dx, dy in directions:
                nx, ny = cx + dx, cy + dy

                # Check bounds and if pixel is unvisited
                if 0 <= nx < width and 0 <= ny < height and not fill_mask[ny, nx]:

                    # Check if the neighbor has the same alpha as target
                    if image_array[ny, nx, 3] == target_alpha:
                        stack.append((nx, ny))
                        fill_mask[ny, nx] = True

        # Only proceed if we're filling transparent areas
        if target_alpha == 0:
            # Paint directly on the QImage only where the mask is True
            for y in range(height):
                for x in range(width):
                    if fill_mask[y, x]:
                        result.setPixelColor(x, y, fill_color)

        return result
