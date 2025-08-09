#!/usr/bin/env node

import { main } from './main';

main().catch((error) => {
  console.error(error);
  process.exit(1);
});