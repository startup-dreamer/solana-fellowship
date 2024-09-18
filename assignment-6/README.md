# Assignment 6: Point-of-Sale Web UI with Solana Pay

## Overview

This assignment implements a Point-of-Sale (POS) Web UI using Next.js and Solana Pay. The application allows users to add products to a cart and complete the checkout process using Solana Pay. After successful payment, a confirmation is displayed to the user.

## Tech Stack

- Next.js: React framework for building the web application
- Solana Pay: For processing payments on the Solana blockchain
- Solana Web3.js: For interacting with the Solana blockchain

## Project Structure

The main components of the project include:

- `pages/`: Contains the Next.js pages for routing
- `styles/`: CSS modules for styling
- `pages/api/`: API routes for handling Solana Pay transactions

## How to Use

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open `http://localhost:3000` in your browser

## Key Components

- Product List: Displays available products for purchase
- Confirmation: Displays transaction details after successful payment

## Solana Pay Integration

The application uses Solana Pay for processing payments. Key steps include:

1. Creating a transaction request
2. Generating a QR code for the Solana Pay transaction
3. Monitoring transaction status
4. Confirming successful payment
