## SOL-CLI
### A demo wallet cli tool for solana utilities.

> [!CAUTION]
> This tool is for demo purposes only. Use at your own risk (for solana devnet).

#### How to install

```bash
git clone https://github.com/solana-developers/wallet-cli.git
cd wallet-cli
npm install
npm run build
chmod +x ./dist/index.js
```

#### How to use

```bash
Usage: sol-cli [options] [command]

Command line tool for basic wallet management and SOL airdrops

Options:
  -V, --version         output the version number
  -h, --help            display help for command

Commands:
  generate [options]    Generates a new keypair and save it as JSON
  airdrop [options]     Airdrop SOL to a specified public key
  getbalance [options]  Fetches the balance of the public key stored or a public key provided
  transfer [options]    Transfer SOL from the keypair in the JSON file to another public key
  help [command]        display help for command
```