# TidyAI-TS

<p align="center">
  <img src="https://img.shields.io/npm/v/tidyai-ts" alt="npm version">
  <img src="https://img.shields.io/github/actions/workflow/status/pawan67/tidyai-ts/build-and-package.yml" alt="Build Status">
  <img src="https://img.shields.io/npm/l/tidyai-ts" alt="License">
  <img src="https://img.shields.io/github/languages/top/pawan67/tidyai-ts" alt="Language">
</p>

<p align="center">
  <img src="https://img.shields.io/npm/dw/tidyai-ts" alt="Weekly Downloads">
  <img src="https://img.shields.io/github/issues/pawan67/tidyai-ts" alt="Issues">
  <img src="https://img.shields.io/github/stars/pawan67/tidyai-ts" alt="Stars">
  <img src="https://img.shields.io/github/forks/pawan67/tidyai-ts" alt="Forks">
</p>

<p align="center">
  <b>Organize your files with AI. Works everywhere. Powered by OpenRouter.</b>
</p>

```
████████╗██╗██████╗ ██╗   ██╗ █████╗ ██╗
╚══██╔══╝██║██╔══██╗╚██╗ ██╔╝██╔══██╗██║
   ██║   ██║██║  ██║ ╚████╔╝ ███████║██║
   ██║   ██║██║  ██║  ╚██╔╝  ██╔══██║██║
   ██║   ██║██████╔╝   ██║   ██║  ██║██║
   ╚═╝   ╚═╝╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝

========================================
  Organize your files with AI power!
========================================
```

_Organize your files with AI. Works everywhere. Powered by OpenRouter._

TidyAI-TS is a cross-platform CLI tool that uses AI to organize your messy folders. It leverages the OpenRouter API to analyze filenames and suggest logical folder structures, making file organization effortless and intelligent.

## 🌟 Features

- AI-powered folder suggestions using OpenRouter API
- Smart file sorting based on file extensions and AI classification
- Undo system to revert changes
- Delete unnecessary files (thumbs.db, .DS*Store, *.tmp, \_.log, desktop.ini)
- Cross-platform CLI (Windows, macOS, Linux)
- Secure and private - only sends filenames to the AI, never file contents
- Robust error handling with fallback to default suggestions
- Beautiful CLI interface with progress indicators
- ASCII art logo and colored output
- Automatic logging of operations with timestamps
- GitHub Actions for CI/CD and automatic releases

## 📦 Installation

### Option 1: Download Standalone Executables (Recommended)

Download the standalone executable for your platform from the [releases page](https://github.com/pawan67/tidyai-ts/releases):

- Windows: `tidyai-win.exe`
- macOS: `tidyai-macos`
- Linux: `tidyai-linux`

These executables can be run directly without needing to install Node.js.

### Option 2: Install from npm (Recommended for library usage)

```bash
npm install tidyai-ts
```

Or install globally:

```bash
npm install -g tidyai-ts
```

### Option 3: Install from Local Directory

If you have the source code locally:

```bash
npm install -g /path/to/tidyai-ts
```

### Option 4: Install from Git Repository

```bash
npm install -g git+https://github.com/pawan67/tidyai-ts.git
```

### Option 5: Run with npx

Run directly from the local directory without installing:

```bash
npx . /path/to/folder
```

## ⚙️ Setup

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Set the API key as an environment variable (choose one method):

### Method 1: Permanent Environment Variable (Recommended)

**Windows (PowerShell):**

```powershell
# Set for current user (permanent)
[Environment]::SetEnvironmentVariable("TIDYAI_API_KEY", "your_openrouter_api_key", "User")
```

**Windows (Command Prompt as Administrator):**

```cmd
setx TIDYAI_API_KEY "your_openrouter_api_key"
```

**macOS/Linux:**

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
echo 'export TIDYAI_API_KEY=your_openrouter_api_key' >> ~/.bashrc
source ~/.bashrc
```

### Method 2: Temporary Environment Variable

**Windows (Command Prompt):**

```cmd
set TIDYAI_API_KEY=your_openrouter_api_key
tidyai-win.exe C:\path\to\your\folder
```

**Windows (PowerShell):**

```powershell
$env:TIDYAI_API_KEY="your_openrouter_api_key"
.\tidyai-win.exe C:\path\to\your\folder
```

**macOS/Linux:**

```bash
export TIDYAI_API_KEY=your_openrouter_api_key
./tidyai-macos /path/to/your/folder  # macOS
./tidyai-linux /path/to/your/folder  # Linux
```

### Method 3: Using the Provided Scripts

Edit the `tidyai.bat` (Windows) or `tidyai.ps1` (PowerShell) file and uncomment the line with your API key:

```batch
set TIDYAI_API_KEY=your_actual_api_key_here
```

Then run:

```cmd
tidyai.bat C:\path\to\your\folder
```

## 🚀 Usage

### Basic Commands

```bash
tidyai --help                   # Show help information
tidyai --version                # Show version information
tidyai /path/to/folder          # Organize files in a folder
tidyai --delete /path/to/folder # Organize and delete unnecessary files
tidyai --undo /path/to/folder   # Undo organization
```

### Help Command Output

```
Usage:
  tidyai [options] [folder_path]
  tidyai --help
  tidyai --version

Options:
  --undo, -u     Undo the organization of a folder
  --delete, -d   Delete unnecessary files after organization
  --help, -h     Show this help message
  --version, -v  Show version information

Examples:
  tidyai /path/to/folder          # Organize files in a folder
  tidyai --delete /path/to/folder # Organize and delete unnecessary files
  tidyai --undo /path/to/folder   # Undo organization
  tidyai --help                   # Show this help message

Notes:
  - Unnecessary files include: thumbs.db, .DS_Store, *.tmp, *.log, desktop.ini
  - Deletion requires confirmation and cannot be undone (files are permanently deleted)
  - Organization history is used for undo operations

Environment Variables:
  TIDYAI_API_KEY  OpenRouter API key for AI-powered suggestions
```

### Example Usage

Here's an example of how TidyAI organizes a messy folder:

**Before:**

```
messy-folder/
├── document.pdf
├── photo.jpg
├── script.js
├── data.csv
├── presentation.pptx
└── video.mp4
```

**After running `tidyai messy-folder`:**

```
messy-folder/
├── Documents/
│   ├── document.pdf
│   └── presentation.pptx
├── Images/
│   └── photo.jpg
├── Scripts/
│   └── script.js
├── Data/
│   └── data.csv
├── Media/
│   └── video.mp4
└── .tidyai/
    ├── history.json
    └── logs/
```

### Beautiful CLI Interface

TidyAI-TS features a beautiful CLI interface with:

- Colorful output for different types of messages
- Progress bars for file operations
- ASCII art logo
- Section headers for better organization
- Timestamped log files in `.tidyai/logs/` directory

Here's what the output looks like when organizing files:

```
████████╗██╗██████╗ ██╗   ██╗ █████╗ ██╗
╚══██╔══╝██║██╔══██╗╚██╗ ██╔╝██╔══██╗██║
   ██║   ██║██║  ██║ ╚████╔╝ ███████║██║
   ██║   ██║██║  ██║  ╚██╔╝  ██╔══██║██║
   ██║   ██║██████╔╝   ██║   ██║  ██║██║
   ╚═╝   ╚═╝╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝

========================================
  Organize your files with AI power!
========================================


┌──────────────────────┐
│ Organization Process │
└──────────────────────┘

ℹ Scanning folder contents...
ℹ Found 4 files to organize
ℹ Getting folder suggestions from AI...
ℹ Sending request to OpenRouter API...

┌──────────────┐
│ Moving Files │
└──────────────┘

Moving files: [████████████████████████████████████████] 100% (4/4) script.js
✓ Moved 4 files into folders
ℹ Saving organization history...
✓ Organization complete!
✓ Successfully organized folder: test-folder
```

## 🛡️ Error Handling

TidyAI-TS includes robust error handling:

- When the API key is not set or invalid, it falls back to default folder suggestions based on file extensions
- API errors are properly caught and logged
- The application continues to function even when the AI service is unavailable
- Prompts user to continue with default suggestions when API key is missing

If you're getting authentication errors, make sure you:

1. Have a valid API key from OpenRouter
2. Are setting the environment variable correctly
3. Are using the correct syntax for your operating system and shell

## 🧪 Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run the CLI:
   ```bash
   npm start -- /path/to/folder
   ```

### Creating Standalone Executables

To create standalone executables for all platforms, you can use the packaging script:

```bash
npm run package
```

This will create the following executables:

- Windows: `tidyai-win.exe`
- macOS: `tidyai-macos`
- Linux: `tidyai-linux`

Alternatively, you can build individual platform executables using the npm scripts:

```bash
npm run build:win    # Windows executable
npm run build:linux  # Linux executable
npm run build:mac    # macOS executable
npm run build:all    # All platforms
```

### Development Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run the TypeScript code directly
- `npm start` - Run the compiled JavaScript
- `npm test` - Run tests
- `npm run package` - Create executables for all platforms
- `npm run clean` - Remove generated executables
- `npm run build:win` - Create Windows executable
- `npm run build:linux` - Create Linux executable
- `npm run build:mac` - Create macOS executable
- `npm run build:all` - Create executables for all platforms

## 📊 Badges

[![npm version](https://img.shields.io/npm/v/tidyai-ts)](https://www.npmjs.com/package/tidyai-ts)
[![Build Status](https://img.shields.io/github/actions/workflow/status/pawan67/tidyai-ts/build-and-package.yml)](https://github.com/pawan67/tidyai-ts/actions)
[![License](https://img.shields.io/npm/l/tidyai-ts)](LICENSE)
[![Language](https://img.shields.io/github/languages/top/pawan67/tidyai-ts)](https://github.com/pawan67/tidyai-ts/search?l=typescript)
[![Weekly Downloads](https://img.shields.io/npm/dw/tidyai-ts)](https://www.npmjs.com/package/tidyai-ts)
[![Issues](https://img.shields.io/github/issues/pawan67/tidyai-ts)](https://github.com/pawan67/tidyai-ts/issues)
[![Stars](https://img.shields.io/github/stars/pawan67/tidyai-ts)](https://github.com/pawan67/tidyai-ts/stargazers)
[![Forks](https://img.shields.io/github/forks/pawan67/tidyai-ts)](https://github.com/pawan67/tidyai-ts/network/members)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
