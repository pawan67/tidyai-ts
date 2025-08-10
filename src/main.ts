import { organizeFolder, undoOrganize, deleteUnnecessaryFiles } from './organizer';
import { parseArguments } from './cli';
import { displayHeader, displayInfo, displaySuccess, displayError, displayWarning } from './cli-utils';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const OPENROUTER_API_KEY = process.env.TIDYAI_API_KEY;

function showHelp() {
  console.log('Usage:');
  console.log('  tidyai [options] [folder_path]');
  console.log('  tidyai --help');
  console.log('  tidyai --version');
  console.log('');
  console.log('Options:');
  console.log('  --undo, -u     Undo the organization of a folder');
  console.log('  --delete, -d   Delete unnecessary files after organization');
  console.log('  --help, -h     Show this help message');
  console.log('  --version, -v  Show version information');
  console.log('');
  console.log('Examples:');
  console.log('  tidyai /path/to/folder          # Organize files in a folder');
  console.log('  tidyai --delete /path/to/folder # Organize and delete unnecessary files');
  console.log('  tidyai --undo /path/to/folder   # Undo organization');
  console.log('  tidyai --help                   # Show this help message');
  console.log('');
  console.log('Notes:');
  console.log('  - Unnecessary files include: thumbs.db, .DS_Store, *.tmp, *.log, desktop.ini');
  console.log('  - Deletion requires confirmation and cannot be undone (files are permanently deleted)');
  console.log('  - Organization history is used for undo operations');
  console.log('');
  console.log('Environment Variables:');
  console.log('  TIDYAI_API_KEY  OpenRouter API key for AI-powered suggestions');
  console.log('');
  console.log('For more information, visit: https://github.com/pawan67/tidyai-ts');
}

function showVersion() {
  console.log('TidyAI-TS v1.1.0');
}

function promptUser(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function checkApiKey(): Promise<boolean> {
  if (!OPENROUTER_API_KEY) {
    displayWarning('TIDYAI_API_KEY environment variable is not set.');
    displayInfo('Without an API key, TidyAI will use default folder suggestions.');
    displayInfo('For better organization, consider getting a free API key from OpenRouter.ai');
    const continueWithoutApiKey = await promptUser('Do you want to continue with default suggestions?');
    return continueWithoutApiKey;
  }
  return true;
}

export async function main() {
  // Display the TidyAI header
  displayHeader();
  
  // If no arguments are provided, show help
  if (process.argv.length <= 2) {
    showHelp();
    return;
  }
  
  const args = process.argv.slice(2);
  
  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  // Check for version flag
  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }
  
  try {
    const parsedArgs = parseArguments(args);
    
    // Check API key for non-undo operations
    if (!parsedArgs.undo) {
      const shouldContinue = await checkApiKey();
      if (!shouldContinue) {
        displayInfo('Operation cancelled by user.');
        return;
      }
    }
    
    if (parsedArgs.undo) {
      await undoOrganize(parsedArgs.path);
      displaySuccess(`Successfully undid organization of folder: ${parsedArgs.path}`);
    } else if (parsedArgs.delete) {
      await deleteUnnecessaryFiles(parsedArgs.path);
      displaySuccess(`Successfully organized and deleted unnecessary files in folder: ${parsedArgs.path}`);
    } else {
      await organizeFolder(parsedArgs.path);
      displaySuccess(`Successfully organized folder: ${parsedArgs.path}`);
    }
  } catch (error) {
    displayError(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}