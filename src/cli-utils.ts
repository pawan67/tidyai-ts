import * as fs from 'fs/promises';
import * as path from 'path';

// ASCII Art for TidyAI
export const tidyAiLogo = `
████████╗██╗██████╗ ██╗   ██╗ █████╗ ██╗
╚══██╔══╝██║██╔══██╗╚██╗ ██╔╝██╔══██╗██║
   ██║   ██║██║  ██║ ╚████╔╝ ███████║██║
   ██║   ██║██║  ██║  ╚██╔╝  ██╔══██║██║
   ██║   ██║██████╔╝   ██║   ██║  ██║██║
   ╚═╝   ╚═╝╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝
`;

// Colors for CLI output
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },

  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Progress bar characters
const progressBarComplete = '█';
const progressBarIncomplete = '░';

// Function to display a progress bar
export function displayProgressBar(percentage: number, width: number = 40): string {
  const completeLength = Math.round(width * percentage);
  const incompleteLength = width - completeLength;
  
  const completeBar = progressBarComplete.repeat(completeLength);
  const incompleteBar = progressBarIncomplete.repeat(incompleteLength);
  
  return `${colors.fg.green}${completeBar}${colors.fg.yellow}${incompleteBar}${colors.reset}`;
}

// Function to log with timestamp
export function logWithTimestamp(message: string, level: string = 'INFO'): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

// Function to create a log entry
export async function createLogEntry(folderPath: string, message: string, logDir: string = '.tidyai/logs'): Promise<void> {
  try {
    const logPath = path.join(folderPath, logDir);
    await fs.mkdir(logPath, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logPath, `tidyai-log-${timestamp}.txt`);
    
    const logContent = logWithTimestamp(message);
    await fs.writeFile(logFile, logContent);
  } catch (error) {
    console.error(`${colors.fg.red}Failed to create log entry: ${error}${colors.reset}`);
  }
}

// Function to display the TidyAI header
export function displayHeader(): void {
  console.log(colors.fg.cyan + tidyAiLogo + colors.reset);
  console.log(colors.fg.blue + '========================================' + colors.reset);
  console.log(colors.fg.yellow + '  Organize your files with AI power!' + colors.reset);
  console.log(colors.fg.blue + '========================================' + colors.reset);
  console.log('');
}

// Function to display a section header
export function displaySectionHeader(title: string): void {
  console.log('');
  console.log(colors.fg.magenta + '┌' + '─'.repeat(title.length + 2) + '┐' + colors.reset);
  console.log(colors.fg.magenta + '│ ' + colors.fg.cyan + title + colors.fg.magenta + ' │' + colors.reset);
  console.log(colors.fg.magenta + '└' + '─'.repeat(title.length + 2) + '┘' + colors.reset);
  console.log('');
}

// Function to display a success message
export function displaySuccess(message: string): void {
  console.log(colors.fg.green + '✓ ' + message + colors.reset);
}

// Function to display an error message
export function displayError(message: string): void {
  console.log(colors.fg.red + '✗ ' + message + colors.reset);
}

// Function to display a warning message
export function displayWarning(message: string): void {
  console.log(colors.fg.yellow + '! ' + message + colors.reset);
}

// Function to display an info message
export function displayInfo(message: string): void {
  console.log(colors.fg.blue + 'ℹ ' + message + colors.reset);
}

// Function to update progress without creating new lines
export function updateProgress(message: string): void {
  process.stdout.write('\r' + message);
}

// Function to clear the progress line
export function clearProgressLine(): void {
  process.stdout.write('\r' + ' '.repeat(80) + '\r');
}