interface Arguments {
  path: string;
  undo: boolean;
}

export function parseArguments(args: string[]): Arguments {
  const parsed: Arguments = {
    path: '',
    undo: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // Skip help and version flags as they're handled in main.ts
    if (arg === '--help' || arg === '-h' || arg === '--version' || arg === '-v') {
      continue;
    }
    
    if (arg === '--undo') {
      parsed.undo = true;
    } else if (!arg.startsWith('-')) {
      parsed.path = arg;
    }
  }

  if (!parsed.path) {
    throw new Error('Please provide a path to organize. Use --help for usage information.');
  }

  return parsed;
}