install:
	pip install -r requirements.txt

run:
	PYTHONPATH=. python main.py

format:
	black .

lint:
	flake8 .

package:
	python setup.py sdist bdist_wheel

help:
	@echo "Available targets:"
	@echo "  install  - Install the required packages"
	@echo "  run      - Run the editor"
	@echo "  format   - Format the code using black"
	@echo "  lint     - Lint the code using flake8"
	@echo "  package  - Create a pip package"
