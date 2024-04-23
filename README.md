# Mobject Developer Tools - Version Check

This is a node.js development helper tool for checking the current versions inside your mobject folder.

## Prerequisites

Before running this project, make sure you have:

- Node.js installed on your system.

## Installation

1. Clone the Repository:
   ```bash
   git clone https://github.com/Mobject-Dev-Team/mobject-dev-versions.git
   cd mobject-dev-versions
   ```
2. Install Dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a .env file in the root directory of the project and add your mobject folder path as follows:

```
MOBJECT_PATH="<your path to mobject folders goes here>"
```

All folders inside will be checked.

## Version check

To check all dependency is up to date in mobject projects, just start the script

```
npm start
```
