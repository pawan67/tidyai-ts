#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command, description) {
  console.log(`\n> ${description}`);
  console.log(`$ ${command}\n`);
  
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    return false;
  }
}

function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

console.log('TidyAI Packaging Script');
console.log('======================');

// Step 1: Build the project
if (!runCommand('npm run build', 'Building the project')) {
  process.exit(1);
}

// Step 2: Create packages for all platforms
console.log('\nCreating packages for all platforms...\n');

const platforms = [
  { name: 'Windows', command: 'npm run build:win', file: 'tidyai-win.exe' },
  { name: 'Linux', command: 'npm run build:linux', file: 'tidyai-linux' },
  { name: 'macOS', command: 'npm run build:mac', file: 'tidyai-macos' }
];

let success = true;

for (const platform of platforms) {
  if (!runCommand(platform.command, `Creating ${platform.name} package`)) {
    success = false;
    console.error(`Failed to create ${platform.name} package`);
    continue;
  }
  
  // Verify the file was created
  if (checkFileExists(platform.file)) {
    console.log(`✓ ${platform.name} package created successfully: ${platform.file}`);
  } else {
    success = false;
    console.error(`✗ ${platform.name} package file not found: ${platform.file}`);
  }
}

// Final summary
console.log('\nPackaging Summary');
console.log('=================');

if (success) {
  console.log('✓ All packages created successfully!');
  console.log('\nCreated files:');
  for (const platform of platforms) {
    if (checkFileExists(platform.file)) {
      const stats = fs.statSync(platform.file);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${platform.file} (${sizeInMB} MB)`);
    }
  }
} else {
  console.error('✗ Some packages failed to create');
  process.exit(1);
}