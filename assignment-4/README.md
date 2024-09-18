# Assignment 4: Native Solana Program for Account Management

## Overview

This assignment implements a native Solana program that allows users to initialize an account, deposit SOL into it, and withdraw 10% of the deposited SOL at a given time. The program is written in Rust and utilizes the Solana Program Library.

## Features

1. Initialize a new account
2. Deposit SOL into the account
3. Withdraw 10% of the deposited SOL at a given time

## Program Structure

The main program logic is contained in `lib.rs` and consists of the following key components:

- `process_instruction`: The main entry point of the program
- `initialize_vault`: Creates and initializes a new vault account
- `deposit_tokens`: Allows users to deposit SOL into their vault
- `withdraw_tokens`: Enables withdrawal of 10% of the deposited SOL

## How to Use

1. Deploy the program to a Solana cluster (devnet or localhost)
2. Use a client application to interact with the program:
   - Initialize a new vault
   - Deposit SOL into the vault
   - Withdraw 10% of the deposited SOL (subject to time restrictions)

## Important Notes

- This program uses a PDA (Program Derived Address) to create and manage vault accounts
- The withdrawal function is restricted to 10% of the deposited amount
- Proper error handling is implemented to ensure secure operations

## Security Considerations

- Ensure that only the account owner can withdraw funds
- Implement proper checks for account ownership and balances
- Use secure random number generation for any time-based restrictions
