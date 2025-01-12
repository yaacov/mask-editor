import os
import sys
import argparse
from PyQt5.QtWidgets import QApplication
from PyQt5.QtCore import Qt

from src.drawing_app import DrawingApp


def main():
    """Main function to initialize and run the drawing application."""
    parser = argparse.ArgumentParser(description="Drawing Tool with Smoothing")
    parser.add_argument(
        "--input_dir",
        default=os.getenv("ORTHO_RESULTS", "./results"),
        help="Directory containing input images (default: $ORTHO_RESULTS or ./results)",
    )
    args = parser.parse_args()

    app = QApplication(sys.argv)

    # Allow CTRL+C to interrupt the Qt event loop
    timer = app.startTimer(500)

    def timerEvent(event):
        app.processEvents()

    app.timerEvent = timerEvent

    window = DrawingApp(input_dir=args.input_dir)
    window.show()
    return app.exec_()
