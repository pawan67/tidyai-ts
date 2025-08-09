# TidyAI-TS

_Organize your files with AI. Works everywhere. Powered by OpenRouter._

TidyAI-TS is a cross-platform CLI tool that uses AI to organize your messy folders. It leverages the OpenRouter API to analyze filenames and suggest logical folder structures, making file organization effortless and intelligent.

## Features

- AI-powered folder suggestions using OpenRouter API
- Smart file sorting based on file extensions and AI classification
- Undo system to revert changes
- Cross-platform CLI (Windows, macOS, Linux)
- Secure and private - only sends filenames to the AI, never file contents
- Robust error handling with fallback to default suggestions
- Beautiful CLI interface with progress indicators
- ASCII art logo and colored output
- Automatic logging of operations with timestamps
- GitHub Actions for CI/CD and automatic releases

## Installation

### Option 1: Download Standalone Executables (Recommended)

Download the standalone executable for your platform from the [releases page](https://github.com/pawan67/tidyai-ts/releases):

- Windows: `tidyai-win.exe`
- macOS: `tidyai-macos`
- Linux: `tidyai-linux`

These executables can be run directly without needing to install Node.js.

### Option 2: Install from npm (Recommended for library usage)

If you want to use TidyAI-TS as a library in your project:

```bash
npm install tidyai-ts
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

### Option 4: Run with npx

Run directly from the local directory without installing:

```bash
npx /path/to/tidyai-ts
```

## Setup

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Set the API key as an environment variable:

```bash
export TIDYAI_API_KEY=your_openrouter_api_key
```

On Windows (Command Prompt):

```cmd
set TIDYAI_API_KEY=your_openrouter_api_key
tidyai-win.exe C:\path\to\your\folder
```

On Windows (PowerShell):

```powershell
$env:TIDYAI_API_KEY="your_openrouter_api_key"
.\tidyai-win.exe C:\path\to\your\folder
```

On macOS/Linux:

```bash
export TIDYAI_API_KEY=your_openrouter_api_key
./tidyai-macos /path/to/your/folder  # macOS
./tidyai-linux /path/to/your/folder  # Linux
```

## Usage

### Basic Commands

```bash
tidyai --help                   # Show help information
tidyai --version                # Show version information
tidyai /path/to/folder          # Organize files in a folder
tidyai --undo /path/to/folder   # Undo organization
```

### Help Command Output

```
Usage:
  tidyai [options] [folder_path]
  tidyai --help
  tidyai --version

Options:
  --undo     Undo the organization of a folder
  --help     Show this help message
  --version  Show version information

Examples:
  tidyai /path/to/folder          # Organize files in a folder
  tidyai --undo /path/to/folder   # Undo organization
  tidyai --help                   # Show this help message

Environment Variables:
  TIDYAI_API_KEY  OpenRouter API key for AI-powered suggestions
```

## Beautiful CLI Interface

TidyAI-TS features a beautiful CLI interface with:

- Colorful output for different types of messages
- Progress bars for file operations
- ASCII art logo
- Section headers for better organization
- Timestamped log files in `.tidyai/logs/` directory

## Error Handling

TidyAI-TS includes robust error handling:

- When the API key is not set or invalid, it falls back to default folder suggestions based on file extensions
- API errors are properly caught and logged
- The application continues to function even when the AI service is unavailable

If you're getting authentication errors, make sure you:

1. Have a valid API key from OpenRouter
2. Are setting the environment variable correctly
3. Are using the correct syntax for your operating system and shell

## Development

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
