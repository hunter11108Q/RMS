const fs = require('fs');
const path = require('path');

const requiredDirs = [
  'apps/backend',
  'apps/desktop',
  'apps/waiter',
  'apps/kitchen',
  'apps/owner',
  'packages/constants',
  'packages/types',
  'packages/api-contracts',
  'packages/validation',
  'packages/theme',
  'packages/utils',
  'packages/hooks',
  'packages/ui',
  'docs/architecture',
  'docs/api',
  'docs/database',
  'docs/ui',
  'docs/deployment',
  'scripts',
  'deployment'
];

console.log('--- Verifying RMS Refined Monorepo Structure ---');
let allClear = true;

requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`[OK] Directory exists: ${dir}`);
  } else {
    console.warn(`[WARNING] Directory missing: ${dir}`);
    allClear = false;
  }
});

if (allClear) {
  console.log('\nSUCCESS: Refined workspace directories verified!');
  process.exit(0);
} else {
  console.error('\nFAILURE: Missing directories in refined workspace.');
  process.exit(1);
}
