from setuptools import setup, find_packages

setup(
    name="ortho-editor",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "black",
        "flake8",
        "PyQt5",
    ],
    entry_points={
        "console_scripts": [
            "ortho-editor=main:main",
        ],
    },
    author="yaacov",
    author_email="kobi.zamir@gmail.com",
    description="ORTHO mask editor tool",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/yaacov/ortho-editor",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
)
