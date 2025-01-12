install:
	pip install -r requirements.txt

run:
	PYTHONPATH=. python main.py

format:
	black .

lint:
	flake8 .

package:
	python -m build

push: package
	twine upload dist/*

clean:
	rm -rf dist/
	rm -rf build/
	rm -rf *.egg-info
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

help:
	@echo "Available targets:"
	@echo "  install  - Install the required packages"
	@echo "  run      - Run the editor"
	@echo "  format   - Format the code using black"
	@echo "  lint     - Lint the code using flake8"
	@echo "  package  - Create a pip package"
	@echo "  push     - Upload package to PyPI using twine"
	@echo "  clean    - Remove build artifacts and Python cache files"
