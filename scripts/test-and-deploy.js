const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running tests...');
try {
  execSync('npx hardhat test', { stdio: 'inherit' });
  console.log('Tests passed successfully!');
} catch (error) {
  console.error('Tests failed:', error.message);
  process.exit(1);
}

console.log('\nDeploying contract to local network...');
try {
  // Start a local node in the background
  const nodeProcess = execSync('npx hardhat node', { stdio: 'inherit', detached: true });
  nodeProcess.unref();
  
  // Wait for the node to start
  console.log('Waiting for local node to start...');
  setTimeout(() => {
    try {
      // Deploy the contract
      const output = execSync('npx hardhat run scripts/deploy.js --network localhost', { encoding: 'utf8' });
      console.log(output);
      
      // Extract the contract address
      const addressMatch = output.match(/LandRegistry deployed to: (0x[a-fA-F0-9]{40})/);
      if (addressMatch && addressMatch[1]) {
        const contractAddress = addressMatch[1];
        console.log(`\nContract deployed to: ${contractAddress}`);
        
        // Update the .env file
        const envPath = path.join(__dirname, '../client/.env');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf8');
          
          // Check if VITE_CONTRACT_ADDRESS already exists
          if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(
              /VITE_CONTRACT_ADDRESS=0x[a-fA-F0-9]{40}/,
              `VITE_CONTRACT_ADDRESS=${contractAddress}`
            );
          } else {
            envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
          }
        } else {
          envContent = `VITE_CONTRACT_ADDRESS=${contractAddress}\nVITE_BASE_URL=http://localhost:3000`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log('Updated client/.env with the new contract address');
      }
    } catch (error) {
      console.error('Failed to deploy contract:', error.message);
    }
  }, 5000); // Wait 5 seconds for the node to start
} catch (error) {
  console.error('Failed to start local node:', error.message);
  process.exit(1);
}

console.log('\nSetup complete! You can now run the client application.');
console.log('Press Ctrl+C to stop the local node when you are done.'); 