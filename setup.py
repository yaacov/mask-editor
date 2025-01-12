from setuptools import setup, find_packages

setup(
    name="ortho-editor",
    version="0.1.13",
    packages=find_packages(),
    include_package_data=True,
    package_data={
        "ortho_editor": ["fonts/*.ttf"],
    },
    install_requires=[
        "black",
        "flake8",
        "PyQt5",
    ],
    entry_points={
        "console_scripts": [
            "ortho-editor=ortho_editor.editor:main",
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
