# Land Ledger

A blockchain-based land registry system that allows users to add, update, and list land properties.

## Smart Contract Testing

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Setup

1. Install dependencies for the smart contract:

```bash
npm install
```

2. Compile the smart contract:

```bash
npm run compile
```

3. Run the tests:

```bash
npm test
```

### Local Development

1. Start a local Hardhat node:

```bash
node scripts/start-local-node.js
```

2. In a new terminal, deploy the contract to the local node:

```bash
npm run deploy:local
```

3. Note the deployed contract address and update it in `client/.env`:

```
VITE_CONTRACT_ADDRESS=<deployed-contract-address>
```

4. Start the client application:

```bash
cd client
npm install
npm run dev
```

## Frontend Development

1. Connect your MetaMask wallet to the local Hardhat network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. Import one of the test accounts provided by Hardhat into MetaMask using the private key.

3. Use the application to add, update, and list land properties.

## Features

- Connect MetaMask wallet
- Add land properties to the blockchain
- Update land details
- List and unlist land for sale
- View land details
- View all lands owned by an address
- View all listed lands
