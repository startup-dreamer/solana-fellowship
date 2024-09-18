# Assignment 2: Web UI for Token Operations

## Overview

This project implements a web-based user interface for managing Solana tokens. It provides functionality for creating tokens, minting, transferring, burning, and delegating token accounts.

## Features

1. Token Creation: Create a new SPL token with custom parameters.
2. Minting: Mint new tokens to a specified account.
3. Transfer: Send tokens from one account to another.
4. Burning: Reduce the token supply by burning tokens.
5. Delegation: Delegate the authority of an Associated Token Account (ATA) to another public key.

## Technologies Used

- Next.js: React framework for building the web application
- Solana Web3.js: For interacting with the Solana blockchain
- @solana/spl-token: Library for SPL token operations
- @solana/wallet-adapter: For wallet connection and management
- TailwindCSS & DaisyUI: For styling the user interface
- React Query: For efficient data fetching and state management

## Setup and Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd assignment-2
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

1. Connect your Solana wallet using the "Connect Wallet" button.
2. Use the provided forms to perform various token operations:
   - Create a new token
   - Mint tokens to an account
   - Transfer tokens between accounts
   - Burn tokens to reduce supply
   - Delegate token account authority

## Important Notes

- This application interacts with the Solana blockchain. Ensure you're connected to the correct network (e.g., devnet for testing).
- Handle private keys and sensitive information with care. Never share your private keys or seed phrases.
- This is a demonstration project and may not be suitable for production use without further security enhancements.

## Contributing

This project is part of the Solana Fellowship program. Contributions are welcome for educational purposes. Please submit issues or pull requests if you have suggestions for improvements.

## License

This project is open-source and available under the [MIT License](LICENSE).
