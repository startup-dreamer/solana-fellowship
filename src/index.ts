#!/usr/bin/env node

import { Command } from "commander";
import { promises as fs } from "fs";
import { keyPairGenerator, airdropPublicKey, getBalance, transferSOL } from "./utilites";

const program = new Command();

program
  .name("sol-cli")
  .description("Command line tool for basic wallet management and SOL airdrops")
  .version("0.0.1");

program
  .command("generate")
  .description("Generates a new keypair and save it as JSON")
  .option("-o, --output <filename>", "output file name", "keypair.json")
  .action(async (options) => {
    const keypair = keyPairGenerator();

    try {
      await fs.writeFile(options.output, keypair);
      console.log(`Keypair saved to ${options.output}`);
    } catch (err) {
      console.error("Error writing file:", err);
    }
  });
program
  .command("airdrop")
  .description("Airdrop SOL to a specified public key")
  .option("-f, --file <filename>", "JSON file containing the keypair")
  .option("-p, --publicKey <publicKey>", "Public key to airdrop SOL to")
  .option("-a, --amount <amount>", "Amount of SOL to airdrop", "1")
  .action(async (options) => {
    try {
      if (options.file && options.publicKey) {
        throw new Error("Please provide either a file or a public key, not both.");
      }
      if (!options.file && !options.publicKey) {
        throw new Error("Please provide either a file or a public key.");
      }
      await airdropPublicKey(options);
    } catch (error) {
      console.error("Error during airdrop:", error);
    }
  });

program
  .command("getbalance")
  .description(
    "Fetches the balance of the public key stored or a public key provided"
  )
  .option(
    "-f, --file <filename>",
    "JSON file containing the keypair"
  )
  .option("-p, --publicKey <publicKey>", "Public key to check balance for")
  .action(async (options) => {
    try {
      if (options.file && options.publicKey) {
        throw new Error("Please provide either a file or a public key, not both.");
      }

      if (!options.file && !options.publicKey) {
        throw new Error("Please provide either a file or a public key.");
      }

      if (options.file) {
        const fileContent = await fs.readFile(options.file, "utf-8");
        const keypairJson = JSON.parse(fileContent);

        if (!keypairJson.publicKey) {
          throw new Error("Invalid JSON file format. Public key not found.");
        }
        getBalance(keypairJson.publicKey);
      } else {
        getBalance(options.publicKey);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  });

program
  .command("transfer")
  .description(
    "Transfer SOL from the keypair in the JSON file to another public key"
  )
  .option(
    "-f, --file <filename>",
    "JSON file containing the sender's keypair",
    "keypair.json"
  )
  .requiredOption("-r, --recipient <publicKey>", "Recipient's public key")
  .requiredOption("-a, --amount <amount>", "Amount of SOL to transfer")
  .action(async (options) => {
    try {
      if (!options.file) {
        throw new Error("Please provide a file containing the sender's keypair.");
      }

      await transferSOL(options);
    } catch (error) {
      console.error("Error during transfer:", error);
    }
  });

program.parse(process.argv);