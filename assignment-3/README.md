# Assignment 3: Asset Manager's Vault

## Overview

This assignment implements an asset manager's vault on the Solana blockchain. The vault allows customers to deposit SPL tokens of their choice, while preventing the vault manager from withdrawing the deposited funds.

## Features

1. Create a new vault
2. Deposit SPL tokens into the vault
3. Withdraw tokens from the vault (restricted to non-manager users)
4. Support for multiple token types within a single vault

## Program Structure

The main program logic is contained in `lib.rs` and consists of the following key components:

- `create_vault`: Initializes a new vault for an asset manager
- `deposit_tokens`: Allows customers to deposit SPL tokens into the vault
- `withdraw_tokens`: Enables withdrawal of tokens by non-manager users
- `VaultState`: Struct to store the vault's state, including asset manager, token mints, and balances

