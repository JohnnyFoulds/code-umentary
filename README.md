# Code-umentary

[![GitHub contributors](https://img.shields.io/github/contributors/JohnnyFoulds/code-docs.svg)](https://GitHub.com/JohnnyFoulds/code-docs/graphs/contributors/)
[![GitHub issues](https://img.shields.io/github/issues/JohnnyFoulds/code-docs.svg)](https://GitHub.com/JohnnyFoulds/code-docs/issues/)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/JohnnyFoulds/code-docs.svg)](https://GitHub.com/JohnnyFoulds/code-docs/pull/)

I am too impatient to wait for [Copilot for Docs](https://githubnext.com/projects/copilot-for-docs) and, from what I have [seen](https://www.youtube.com/watch?v=BBU2mwM9WDE) so far, it is not going to be exactly the tool I want. So time to create our own!

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Description

Code-umentary is a web-based editor for creating code documentation, or actually anything else where you want some AI assistance to learn new skills. It allows users to create a document with code snippets, explanations, and formatting options, all in one place. That sounds perfectly boring, but the main feature is that integration with the GPTs to both help you write code and create learning notes for yourself and others.

## Installation

Code-umentary is a web-based application that can be run on any modern web browser. Simply navigate to the [demo page](https://code-umentary.com) to start using it.

If you want to install it locally, you can clone the repository and run the application using a local web server:

```bash
git clone https://github.com/JohnnyFoulds/code-umentary/code-umentary.git
cd code-umentary
python -m http.server -d src
```

Then, navigate to `http://localhost:8000` in your web browser.


## Usage

To get started with Code-umentary, simply open the application and start creating your document. You can add code snippets, format text, and add explanations as needed. Once you're finished, you can export your document as a MARKDOWN file for easy sharing and collaboration.

## Contributing

If you'd like to contribute to Code-umentary, please follow these steps:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/new-feature`)
3. Make your changes and commit them (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a new pull request
