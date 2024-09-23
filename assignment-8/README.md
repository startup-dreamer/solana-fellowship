# Assignment 8: Create a cNFT Collection

## Overview

This assignment involves creating a cNFT (compressed NFT) collection and airdropping it to other fellows. The application will use the Solana blockchain to mint and distribute the cNFTs.

## Tech Stack

- TypeScript: For writing the application code
- Solana Web3.js: For interacting with the Solana blockchain
- Express: For building the backend API
- dotenv: For managing environment variables
- @metaplex-foundation/umi: For handling NFT creation and transactions
- @metaplex-foundation/mpl-bubblegum: For managing Merkle Trees and compressed NFTs
- @metaplex-foundation/mpl-token-metadata: For handling token metadata
- @metaplex-foundation/umi-bundle-defaults: For default Umi bundle configurations
- @metaplex-foundation/umi-web3js-adapters: For adapting Umi to Web3.js
- @solana/actions: For Solana blockchain actions
- bs58: For Base58 encoding/decoding

## Project Structure

The main components of the project include:

- `index.ts`: Entry point of the application
- `utils.ts`: Utility functions for Solana and Umi integration
- `Merkle-Tree.ts`: Functions for creating and managing Merkle Trees
- `cNFT.ts`: Functions for minting individual cNFTs
- `cNFTCollection.ts`: Functions for minting and managing cNFT collections

## How to Use

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables in a `.env` file based on the `.env.example`
4. Start the development server: `npm run dev`

## Key Components

- Minting Handler: Mints cNFTs with specified metadata
- Airdrop Handler: Airdrops the minted cNFTs to specified addresses
- Merkle Tree Handler: Creates and manages Merkle Trees for compressed NFTs

## Solana Integration

The application uses Solana for minting and airdropping cNFTs. Key steps include:

1. Setting up Solana configuration and environment variables
2. Creating and managing Merkle Trees
3. Minting cNFTs with metadata
4. Airdropping cNFTs to other fellows
