import * as fs from 'fs/promises';
import * as path from 'path';
import { OpenRouterClient } from './openrouter';
import { 
  displaySectionHeader, 
  displayInfo, 
  displaySuccess, 
  displayError, 
  displayProgressBar,
  createLogEntry,
  updateProgress,
  clearProgressLine
} from './cli-utils';

const HISTORY_FILE = '.tidyai/history.json';

export interface FileMove {
  fileName: string;
  originalPath: string;
  newPath: string;
}

export interface OrganizationHistory {
  timestamp: string;
  moves: FileMove[];
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

export async function undoOrganize(folderPath: string) {
  displaySectionHeader('Undo Process');
  
  const historyPath = path.join(folderPath, HISTORY_FILE);
  
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