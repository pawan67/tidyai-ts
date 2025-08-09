import { organizeFolder, undoOrganize } from './organizer';
import { parseArguments } from './cli';
import { displayHeader, displayInfo, displaySuccess, displayError } from './cli-utils';

function showHelp() {
  console.log('Usage:');
  console.log('  tidyai [options] [folder_path]');
  console.log('  tidyai --help');
  console.log('  tidyai --version');
  console.log('');
  console.log('Options:');
  console.log('  --undo     Undo the organization of a folder');
  console.log('  --help     Show this help message');
  console.log('  --version  Show version information');
  console.log('');
  console.log('Examples:');
  console.log('  tidyai /path/to/folder          # Organize files in a folder');
  console.log('  tidyai --undo /path/to/folder   # Undo organization');
  console.log('  tidyai --help                   # Show this help message');
  console.log('');
  console.log('Environment Variables:');
  console.log('  TIDYAI_API_KEY  OpenRouter API key for AI-powered suggestions');
  console.log('');
  console.log('For more information, visit: https://github.com/yourusername/tidyai-ts');
}

function showVersion() {
  console.log('TidyAI-TS v1.0.0');
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
    
    if (parsedArgs.undo) {
      await undoOrganize(parsedArgs.path);
      displaySuccess(`Successfully undid organization of folder: ${parsedArgs.path}`);
    } else {
      await organizeFolder(parsedArgs.path);
      displaySuccess(`Successfully organized folder: ${parsedArgs.path}`);
    }
  } catch (error) {
    displayError(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}