import sys
import signal
from src.editor import main


def signal_handler(signum, frame):
    """Handle CTRL+C by closing the Qt application"""
    from PyQt5.QtWidgets import QApplication

    QApplication.quit()


if __name__ == "__main__":
    # Set up signal handler for CTRL+C
    signal.signal(signal.SIGINT, signal_handler)
    sys.exit(main())
