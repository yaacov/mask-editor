from PyQt5.QtWidgets import (
    QToolBar,
    QAction,
    QPushButton,
    QSlider,
    QSpinBox,
    QButtonGroup,
    QToolButton,
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QColor, QFontDatabase, QFont
import os

# Material Icons constants
ICON_FOLDER_OPEN = "\ue2c8"
ICON_SAVE = "\ue161"
ICON_BRUSH = "\ue3ae"
ICON_LINE = "\ue922"
ICON_FORMAT_PAINT = "\ue243"
ICON_CIRCLE = "\ue3a6"
ICON_UNDO = "\ue166"
ICON_REDO = "\ue15a"
ICON_FILTER = "\ue3a5"
ICON_TUNE = "\ue15b"
ICON_AUTO_FIX = "\ue663"
ICON_ZOOM_IN = "\ue145"
ICON_ZOOM_OUT = "\ue15b"
ICON_ZOOM_FIT = "\ue56b"
ICON_ZOOM_100 = "\ue3b1"


class UIComponents:
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self.load_material_icons()
        self.setup_secondary_toolbar()
        self.setup_toolbar()
        if hasattr(self.main_window, "graphics_view"):
            self.main_window.graphics_view.update_pencil_cursor()

    def load_material_icons(self):
        """Load Material Icons font"""
        font_path = os.path.join(
            os.path.dirname(__file__), "fonts", "MaterialIcons-Regular.ttf"
        )
        font_id = QFontDatabase.addApplicationFont(font_path)
        if font_id != -1:
            self.icon_font = QFont("Material Icons")
            self.icon_font.setPixelSize(24)
        else:
            print(f"Error: Could not load Material Icons font from {font_path}")
            self.icon_font = None

    def create_icon_action(self, icon_text, text, shortcut=None, tooltip=None):
        """Create an action with a material icon"""
        action = QAction(text, self.main_window)
        if self.icon_font:
            action.setFont(self.icon_font)
            action.setText(icon_text)
        if shortcut:
            action.setShortcut(shortcut)
        if tooltip:
            action.setToolTip(f"{tooltip} ({shortcut})" if shortcut else tooltip)
        return action

    def create_icon_button(self, icon_text, text, checkable=True):
        """Create a tool button with a material icon"""
        button = QToolButton()
        if self.icon_font:
            button.setFont(self.icon_font)
            button.setText(icon_text)
        button.setToolTip(text)
        if checkable:
            button.setCheckable(True)
        return button

    def setup_toolbar(self):
        """Create and setup the main toolbar with drawing tools"""
        self.toolbar = QToolBar()
        self.main_window.addToolBar(self.toolbar)

        # Create actions with icons
        self.open_action = self.create_icon_action(
            ICON_FOLDER_OPEN, "Open Directory", "Ctrl+O", "Open Directory"
        )
        self.save_action = self.create_icon_action(ICON_SAVE, "Save", "Ctrl+S", "Save")

        # Create tool buttons with icons
        self.pencil_button = self.create_icon_button(ICON_BRUSH, "Pencil")
        self.line_button = self.create_icon_button(ICON_LINE, "Line")
        self.fill_button = self.create_icon_button(ICON_FORMAT_PAINT, "Fill")
        self.eraser_button = self.create_icon_button(ICON_CIRCLE, "Eraser")

        # Create other actions with icons
        self.undo_action = self.create_icon_action(ICON_UNDO, "Undo", "Ctrl+Z", "Undo")
        self.redo_action = self.create_icon_action(
            ICON_REDO, "Redo", "Ctrl+Shift+Z", "Redo"
        )
        self.smooth_action = self.create_icon_action(
            ICON_FILTER, "Smooth", None, "Smooth"
        )
        self.thin_action = self.create_icon_action(ICON_TUNE, "Thin", None, "Thin")
        self.smooth_thin_smooth_action = self.create_icon_action(
            ICON_AUTO_FIX, "Smooth-Thin-Smooth", None, "Smooth-Thin-Smooth"
        )

        # Add actions and buttons to toolbar
        self.toolbar.addAction(self.open_action)
        self.toolbar.addAction(self.save_action)
        self.toolbar.addSeparator()
        self.toolbar.addWidget(self.pencil_button)
        self.toolbar.addWidget(self.line_button)
        self.toolbar.addWidget(self.fill_button)
        self.toolbar.addSeparator()
        self.toolbar.addWidget(self.eraser_button)
        self.toolbar.addSeparator()
        self.toolbar.addAction(self.undo_action)
        self.toolbar.addAction(self.redo_action)
        self.toolbar.addSeparator()
        self.toolbar.addAction(self.smooth_action)
        self.toolbar.addAction(self.thin_action)
        self.toolbar.addAction(self.smooth_thin_smooth_action)
        self.toolbar.addSeparator()

        # Add size controls
        self.size_label = QAction("Size:", self.main_window)
        self.toolbar.addAction(self.size_label)

        self.setup_size_controls()
        self.setup_size_presets()

        self.toolbar.addSeparator()

        self.setup_color_button()
        self.update_color_button(QColor(255, 165, 0))

    def setup_secondary_toolbar(self):
        """Create and setup a secondary toolbar for opacity and zoom controls"""
        self.secondary_toolbar = QToolBar()
        # Add the secondary toolbar to the bottom of the window
        self.main_window.addToolBar(Qt.BottomToolBarArea, self.secondary_toolbar)

        # Add opacity controls
        self.opacity_label = QAction("Opacity:", self.main_window)
        self.secondary_toolbar.addAction(self.opacity_label)

        self.opacity_slider = QSlider(Qt.Horizontal)
        self.opacity_slider.setMinimum(0)
        self.opacity_slider.setMaximum(100)
        self.opacity_slider.setValue(50)
        self.opacity_slider.setFixedWidth(100)
        self.secondary_toolbar.addWidget(self.opacity_slider)

        self.secondary_toolbar.addSeparator()

        # Add zoom controls with proper actions
        self.zoom_label = QAction("Zoom:", self.main_window)
        self.secondary_toolbar.addAction(self.zoom_label)

        self.zoom_out_action = self.create_icon_action(
            ICON_ZOOM_OUT, "Zoom Out", "Ctrl+-", "Zoom Out"
        )
        self.secondary_toolbar.addAction(self.zoom_out_action)

        self.zoom_level_label = QAction("100%", self.main_window)
        self.zoom_level_label.setEnabled(False)
        self.secondary_toolbar.addAction(self.zoom_level_label)

        self.zoom_in_action = self.create_icon_action(
            ICON_ZOOM_IN, "Zoom In", "Ctrl++", "Zoom In"
        )
        self.secondary_toolbar.addAction(self.zoom_in_action)

        self.zoom_fit_action = self.create_icon_action(
            ICON_ZOOM_FIT, "Fit", None, "Fit to Window"
        )
        self.secondary_toolbar.addAction(self.zoom_fit_action)

        self.zoom_100_action = self.create_icon_action(
            ICON_ZOOM_100, "100%", "Ctrl+0", "Actual Size"
        )
        self.secondary_toolbar.addAction(self.zoom_100_action)

    def setup_size_controls(self):
        """Setup size spinbox and slider"""
        self.size_spinbox = QSpinBox()
        self.size_spinbox.setMinimum(4)
        self.size_spinbox.setMaximum(100)
        self.size_spinbox.setValue(8)
        self.size_spinbox.setFixedWidth(60)
        self.toolbar.addWidget(self.size_spinbox)

        self.size_slider = QSlider(Qt.Horizontal)
        self.size_slider.setMinimum(4)
        self.size_slider.setMaximum(100)
        self.size_slider.setValue(8)
        self.size_slider.setFixedWidth(100)
        self.toolbar.addWidget(self.size_slider)

        self.toolbar.addSeparator()

    def setup_size_presets(self):
        """Setup preset size buttons"""
        self.size_button_group = QButtonGroup()
        self.size_button_group.setExclusive(True)

        # Define preset sizes
        presets = [4, 8, 16, 32]

        for size in presets:
            btn = QPushButton(str(size))
            btn.setCheckable(True)
            btn.setFixedSize(32, 32)
            if size == 8:  # Default size
                btn.setChecked(True)
            self.toolbar.addWidget(btn)
            self.size_button_group.addButton(btn)
            btn.clicked.connect(lambda checked, s=size: self.update_size_controls(s))

    def update_size_controls(self, size):
        """Update all size controls to match the given size"""
        self.size_slider.setValue(size)
        self.size_spinbox.setValue(size)

        # Update button states
        for button in self.size_button_group.buttons():
            button.setChecked(int(button.text()) == size)

    def setup_color_button(self):
        """Setup color picker button"""
        self.color_button = QPushButton()
        self.color_button.setFixedSize(32, 32)
        self.toolbar.addWidget(self.color_button)
        # Color will be set when tool is selected

    def update_color_button(self, color):
        """Update color button appearance"""
        self.color_button.setStyleSheet(
            f"background-color: {color.name()}; border: 2px solid #666666;"
        )

    def update_tool_specific_controls(self, tool):
        """Update controls based on tool settings"""
        settings = self.main_window.state.current_tool_settings
        self.update_size_controls(settings["size"])
        self.update_color_button(settings["color"])
        self.color_button.setEnabled(tool != "Eraser")
