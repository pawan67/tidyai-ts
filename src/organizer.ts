import * as fs from 'fs/promises';
import * as path from 'path';
import { OpenRouterClient } from './openrouter';
import { 
  displaySectionHeader, 
  displayInfo, 
  displaySuccess, 
  displayError, 
  displayWarning,
  displayProgressBar,
  createLogEntry,
  updateProgress,
  clearProgressLine
} from './cli-utils';
import * as readline from 'readline';

const HISTORY_FILE = '.tidyai/history.json';
const DELETE_HISTORY_FILE = '.tidyai/delete-history.json';

export interface FileMove {
  fileName: string;
  originalPath: string;
  newPath: string;
}

export interface OrganizationHistory {
  timestamp: string;
  moves: FileMove[];
}

export interface DeleteHistory {
  timestamp: string;
  deletedFiles: string[];
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

export async function organizeFolder(folderPath: string) {
  displaySectionHeader('Organization Process');
  
  // Check if already organized
  const historyPath = path.join(folderPath, HISTORY_FILE);
  try {
    await fs.access(historyPath);
    displayInfo('This folder appears to be already organized. Use --undo to revert changes.');
    // Create a log entry
    await createLogEntry(folderPath, 'Folder already organized, no action taken');
    return;
  } catch (error) {
    // History file doesn't exist, which is what we expect
  }

  // Create history directory
  const historyDir = path.dirname(historyPath);
  await fs.mkdir(historyDir, { recursive: true });

  // Read files in the directory
  displayInfo('Scanning folder contents...');
  const files = await fs.readdir(folderPath);
  
  // Filter out directories and history file
  const fileNames: string[] = [];
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = await fs.stat(filePath);
    if (stat.isFile() && filePath !== historyPath) {
      fileNames.push(file);
    }
  }

  if (fileNames.length === 0) {
    displayInfo('No files to organize in this directory.');
    // Create a log entry
    await createLogEntry(folderPath, 'No files to organize in directory');
    return;
  }

  displayInfo(`Found ${fileNames.length} files to organize`);
  
  // Get folder suggestions from AI
  displayInfo('Getting folder suggestions from AI...');
  const client = new OpenRouterClient();
  const suggestions = await client.getSuggestions(fileNames);

  // Create folders and move files
  displaySectionHeader('Moving Files');
  const moves: FileMove[] = [];
  
  // Progress tracking
  let processedFiles = 0;
  const totalFiles = fileNames.length;
  
  for (const fileName of fileNames) {
    const suggestedFolder = suggestions[fileName] || 'Other';
    const targetDir = path.join(folderPath, suggestedFolder);
    
    // Create target directory if it doesn't exist
    await fs.mkdir(targetDir, { recursive: true });
    
    // Move file
    const originalPath = path.join(folderPath, fileName);
    const newPath = path.join(targetDir, fileName);
    
    await fs.rename(originalPath, newPath);
    
    moves.push({
      fileName,
      originalPath,
      newPath
    });
    
    // Update progress
    processedFiles++;
    const percentage = processedFiles / totalFiles;
    const progressBar = displayProgressBar(percentage);
    updateProgress(`Moving files: [${progressBar}] ${Math.round(percentage * 100)}% (${processedFiles}/${totalFiles}) ${fileName}`);
  }
  
  // Clear the progress line and show completion
  clearProgressLine();
  displaySuccess(`Moved ${moves.length} files into folders`);

  // Save history
  displayInfo('Saving organization history...');
  const history: OrganizationHistory = {
    timestamp: new Date().toISOString(),
    moves
  };
  
  await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  
  // Create a log entry
  await createLogEntry(folderPath, `Organized ${moves.length} files into folders`, '.tidyai/logs');
  
  displaySuccess('Organization complete!');
}

export async function deleteUnnecessaryFiles(folderPath: string) {
  displaySectionHeader('Delete Unnecessary Files');
  
  // First organize the folder
  await organizeFolder(folderPath);
  
  // Find potentially unnecessary files
  displayInfo('Scanning for unnecessary files...');
  const unnecessaryFiles: string[] = [];
  
  // Walk through all subdirectories to find files
  async function walkDir(dir: string) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      // Skip .tidyai directory
      if (file === '.tidyai') continue;
      
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await walkDir(filePath);
      } else {
        // Check if file is potentially unnecessary
        const fileName = path.basename(file).toLowerCase();
        if (
          fileName === 'thumbs.db' ||
          fileName === '.ds_store' ||
          fileName.endsWith('.tmp') ||
          fileName.endsWith('.log') ||
          fileName === 'desktop.ini'
        ) {
          unnecessaryFiles.push(filePath);
        }
      }
    }
  }
  
  await walkDir(folderPath);
  
  if (unnecessaryFiles.length === 0) {
    displayInfo('No unnecessary files found.');
    await createLogEntry(folderPath, 'No unnecessary files found during deletion process', '.tidyai/logs');
    return;
  }
  
  displayWarning(`Found ${unnecessaryFiles.length} potentially unnecessary files:`);
  for (const file of unnecessaryFiles) {
    console.log(`  - ${file}`);
  }
  
  // Prompt user for confirmation
  const confirmDelete = await promptUser('Are you sure you want to delete these files? This action cannot be undone without a backup.');
  if (!confirmDelete) {
    displayInfo('File deletion cancelled by user.');
    await createLogEntry(folderPath, 'File deletion cancelled by user', '.tidyai/logs');
    return;
  }
  
  // Save delete history for potential undo
  const deleteHistoryPath = path.join(folderPath, DELETE_HISTORY_FILE);
  const deleteHistory: DeleteHistory = {
    timestamp: new Date().toISOString(),
    deletedFiles: []
  };
  
  // Create delete history directory
  const deleteHistoryDir = path.dirname(deleteHistoryPath);
  await fs.mkdir(deleteHistoryDir, { recursive: true });
  
  // Delete files and save their paths for undo
  displaySectionHeader('Deleting Files');
  let deletedCount = 0;
  const totalFiles = unnecessaryFiles.length;
  
  for (const filePath of unnecessaryFiles) {
    try {
      // Save file content for potential recovery
      deleteHistory.deletedFiles.push(filePath);
      
      // Delete file
      await fs.rm(filePath);
      deletedCount++;
      
      // Update progress
      const percentage = deletedCount / totalFiles;
      const progressBar = displayProgressBar(percentage);
      updateProgress(`Deleting files: [${progressBar}] ${Math.round(percentage * 100)}% (${deletedCount}/${totalFiles}) ${path.basename(filePath)}`);
    } catch (error) {
      displayWarning(`Failed to delete ${filePath}: ${(error as Error).message}`);
    }
  }
  
  // Clear the progress line and show completion
  clearProgressLine();
  
  // Save delete history
  await fs.writeFile(deleteHistoryPath, JSON.stringify(deleteHistory, null, 2));
  
  displaySuccess(`Deleted ${deletedCount} unnecessary files.`);
  await createLogEntry(folderPath, `Deleted ${deletedCount} unnecessary files`, '.tidyai/logs');
}

export async function undoOrganize(folderPath: string) {
  displaySectionHeader('Undo Process');
  
  const historyPath = path.join(folderPath, HISTORY_FILE);
  const deleteHistoryPath = path.join(folderPath, DELETE_HISTORY_FILE);
  
  // Check if we have delete history to undo
  let hasDeleteHistory = false;
  try {
    await fs.access(deleteHistoryPath);
    hasDeleteHistory = true;
  } catch (error) {
    // No delete history, that's fine
  }
  
  // First undo file deletions if they exist
  if (hasDeleteHistory) {
    try {
      const deleteHistoryData = await fs.readFile(deleteHistoryPath, 'utf-8');
      const deleteHistory: DeleteHistory = JSON.parse(deleteHistoryData);
      
      displayWarning('Undoing file deletions is not possible as we do not store file contents.');
      displayInfo('However, we can remove the delete history record.');
      
      // Remove delete history file
      await fs.rm(deleteHistoryPath);
      await createLogEntry(folderPath, 'Removed delete history during undo process', '.tidyai/logs');
    } catch (error) {
      displayWarning(`Error processing delete history: ${(error as Error).message}`);
    }
  }
  
  // Then undo file organization
  try {
    const historyData = await fs.readFile(historyPath, 'utf-8');
    const history: OrganizationHistory = JSON.parse(historyData);
    
    displayInfo(`Found history for ${history.moves.length} files`);
    
    // Move files back to their original locations
    displaySectionHeader('Restoring Files');
    
    // Progress tracking
    let processedFiles = 0;
    const totalFiles = history.moves.length;
    
    for (const move of history.moves) {
      // Create directory for original path if needed
      const originalDir = path.dirname(move.originalPath);
      await fs.mkdir(originalDir, { recursive: true });
      
      // Move file back
      await fs.rename(move.newPath, move.originalPath);
      
      // Update progress
      processedFiles++;
      const percentage = processedFiles / totalFiles;
      const progressBar = displayProgressBar(percentage);
      updateProgress(`Restoring files: [${progressBar}] ${Math.round(percentage * 100)}% (${processedFiles}/${totalFiles}) ${move.fileName}`);
    }
    
    // Clear the progress line and show completion
    clearProgressLine();
    displaySuccess(`Restored ${history.moves.length} files to their original locations`);
    
    // Remove empty folders
    displayInfo('Cleaning up empty folders...');
    const folders = [...new Set(history.moves.map(move => path.dirname(move.newPath)))];
    let removedFolders = 0;
    
    for (const folder of folders) {
      try {
        const files = await fs.readdir(folder);
        if (files.length === 0) {
          await fs.rmdir(folder);
          removedFolders++;
        }
      } catch (error) {
        // Ignore errors when trying to remove folders
      }
    }
    
    if (removedFolders > 0) {
      displaySuccess(`Removed ${removedFolders} empty folders`);
    }
    
    // Remove history file
    await fs.rm(historyPath);
    
    // Create a log entry
    await createLogEntry(folderPath, `Undid organization of ${history.moves.length} files`, '.tidyai/logs');
    
    displaySuccess('Undo complete!');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      displayInfo('No organization history found for this folder.');
      // Create a log entry
      await createLogEntry(folderPath, 'No organization history found for folder', '.tidyai/logs');
    } else {
      displayError(`Error during undo: ${(error as Error).message}`);
      throw error;
    }
  }
}