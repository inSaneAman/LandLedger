const { spawn } = require('child_process');
const path = require('path');

console.log('Starting local Hardhat node...');

const node = spawn('npx', ['hardhat', 'node'], {
  stdio: 'inherit',
  shell: true
});

node.on('error', (err) => {
  console.error('Failed to start node:', err);
});

console.log('Local node started. Press Ctrl+C to stop.'); 