#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const utilites_1 = require("./utilites");
const program = new commander_1.Command();
program
    .name("sol-cli")
    .description("Command line tool for basic wallet management and SOL airdrops")
    .version("0.0.1");
program
    .command("generate")
    .description("Generates a new keypair and save it as JSON")
    .option("-o, --output <filename>", "output file name", "keypair.json")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    const keypair = (0, utilites_1.keyPairGenerator)();
    try {
        yield fs_1.promises.writeFile(options.output, keypair);
        console.log(`Keypair saved to ${options.output}`);
    }
    catch (err) {
        console.error("Error writing file:", err);
    }
}));
program
    .command("airdrop")
    .description("Airdrop SOL to a specified public key")
    .option("-f, --file <filename>", "JSON file containing the keypair")
    .option("-p, --publicKey <publicKey>", "Public key to airdrop SOL to")
    .option("-a, --amount <amount>", "Amount of SOL to airdrop", "1")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (options.file && options.publicKey) {
            throw new Error("Please provide either a file or a public key, not both.");
        }
        if (!options.file && !options.publicKey) {
            throw new Error("Please provide either a file or a public key.");
        }
        yield (0, utilites_1.airdropPublicKey)(options);
    }
    catch (error) {
        console.error("Error during airdrop:", error);
    }
}));
program
    .command("getbalance")
    .description("Fetches the balance of the public key stored or a public key provided")
    .option("-f, --file <filename>", "JSON file containing the keypair")
    .option("-p, --publicKey <publicKey>", "Public key to check balance for")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (options.file && options.publicKey) {
            throw new Error("Please provide either a file or a public key, not both.");
        }
        if (!options.file && !options.publicKey) {
            throw new Error("Please provide either a file or a public key.");
        }
        if (options.file) {
            const fileContent = yield fs_1.promises.readFile(options.file, "utf-8");
            const keypairJson = JSON.parse(fileContent);
            if (!keypairJson.publicKey) {
                throw new Error("Invalid JSON file format. Public key not found.");
            }
            (0, utilites_1.getBalance)(keypairJson.publicKey);
        }
        else {
            (0, utilites_1.getBalance)(options.publicKey);
        }
    }
    catch (err) {
        console.error("Error:", err);
    }
}));
program
    .command("transfer")
    .description("Transfer SOL from the keypair in the JSON file to another public key")
    .option("-f, --file <filename>", "JSON file containing the sender's keypair", "keypair.json")
    .requiredOption("-r, --recipient <publicKey>", "Recipient's public key")
    .requiredOption("-a, --amount <amount>", "Amount of SOL to transfer")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!options.file) {
            throw new Error("Please provide a file containing the sender's keypair.");
        }
        yield (0, utilites_1.transferSOL)(options);
    }
    catch (error) {
        console.error("Error during transfer:", error);
    }
}));
program.parse(process.argv);
