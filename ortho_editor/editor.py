import os
import signal
import sys
import argparse
from PyQt5.QtWidgets import QApplication

from ortho_editor.drawing_app import DrawingApp


def editor():
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
    app.startTimer(500)

    def timerEvent(event):
        app.processEvents()

    app.timerEvent = timerEvent

    window = DrawingApp(input_dir=args.input_dir)
    window.show()
    return app.exec_()


def signal_handler(signum, frame):
    """Handle CTRL+C by closing the Qt application"""
    from PyQt5.QtWidgets import QApplication

    QApplication.quit()


def main():
    # Set up signal handler for CTRL+C
    signal.signal(signal.SIGINT, signal_handler)
    sys.exit(editor())


if __name__ == "__main__":
    main()
