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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferSOL = exports.getBalance = exports.airdropPublicKey = exports.keyPairGenerator = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
function keyPairGenerator() {
    const keypair = new web3_js_1.Keypair();
    const secret = keypair.secretKey;
    const keypairJson = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: Array.from(secret),
    };
    const jsonString = JSON.stringify(keypairJson, null, 2);
    return jsonString;
}
exports.keyPairGenerator = keyPairGenerator;
function airdropPublicKey(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let publicKey;
            if (options.file) {
                const fileContent = yield fs_1.default.promises.readFile(options.file, "utf-8");
                const keypairJson = JSON.parse(fileContent);
                if (!keypairJson.publicKey) {
                    throw new Error("Invalid JSON file format. Public key not found.");
                }
                publicKey = new web3_js_1.PublicKey(keypairJson.publicKey);
            }
            else {
                publicKey = new web3_js_1.PublicKey(options.publicKey);
            }
            const connection = new web3_js_1.Connection("https://api.devnet.solana.com");
            const amountLamports = options.amount * 1e9;
            console.log(`Requesting airdrop of ${options.amount} SOL to ${publicKey.toBase58()}...`);
            const txhash = yield connection.requestAirdrop(publicKey, amountLamports);
            console.log(`Airdrop successful. Transaction hash: ${txhash}`);
            return txhash;
        }
        catch (error) {
            console.error("Error during airdrop:", error);
            throw error;
        }
    });
}
exports.airdropPublicKey = airdropPublicKey;
function getBalance(publicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = new web3_js_1.Connection("https://api.devnet.solana.com");
        try {
            const balance = yield connection.getBalance(new web3_js_1.PublicKey(publicKey));
            console.log(`Balance of ${publicKey}: ${balance / 1e9} SOL`);
        }
        catch (error) {
            console.error(`Failed to get balance of account ${publicKey}:`, error);
        }
    });
}
exports.getBalance = getBalance;
function transferSOL(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fileContent = yield fs_1.default.promises.readFile(options.file, "utf-8");
            const keypairJson = JSON.parse(fileContent);
            if (!keypairJson.publicKey || !keypairJson.secretKey) {
                throw new Error("Invalid JSON file format. Public key or secret key not found.");
            }
            const senderKeypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(keypairJson.secretKey));
            const connection = new web3_js_1.Connection("https://api.devnet.solana.com");
            const recipientPublicKey = new web3_js_1.PublicKey(options.recipient);
            const balance = yield connection.getBalance(senderKeypair.publicKey);
            const amountLamports = parseFloat(options.amount) * 1e9;
            if (balance < amountLamports) {
                throw new Error(`Insufficient balance. Current balance: ${balance / 1e9} SOL, Attempted transfer: ${options.amount} SOL`);
            }
            const transferInstruction = web3_js_1.SystemProgram.transfer({
                fromPubkey: senderKeypair.publicKey,
                toPubkey: recipientPublicKey,
                lamports: amountLamports,
            });
            const transaction = new web3_js_1.Transaction().add(transferInstruction);
            console.log(`Transferring ${options.amount} SOL from ${senderKeypair.publicKey.toBase58()} to ${recipientPublicKey.toBase58()}...`);
            const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [senderKeypair]);
            console.log(`Transfer successful. Transaction signature: ${signature}`);
            return signature;
        }
        catch (err) {
            console.error("Error:", err);
            throw err;
        }
    });
}
exports.transferSOL = transferSOL;
