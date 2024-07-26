import {
  Keypair,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import fs from "fs";

export function keyPairGenerator() {
  const keypair = new Keypair();
  const secret = keypair.secretKey;

  const keypairJson = {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Array.from(secret),
  };

  const jsonString = JSON.stringify(keypairJson, null, 2);
  return jsonString;
}

export async function airdropPublicKey(options: { file?: string; publicKey?: string; amount: number }): Promise<string> {
  try {
    let publicKey: PublicKey;

    if (options.file) {
      const fileContent = await fs.promises.readFile(options.file, "utf-8");
      const keypairJson = JSON.parse(fileContent);

      if (!keypairJson.publicKey) {
        throw new Error("Invalid JSON file format. Public key not found.");
      }

      publicKey = new PublicKey(keypairJson.publicKey);
    } else {
      publicKey = new PublicKey(options.publicKey!);
    }
    const connection = new Connection("https://api.devnet.solana.com");

    const amountLamports = options.amount * 1e9;

    console.log(`Requesting airdrop of ${options.amount} SOL to ${publicKey.toBase58()}...`);

    const txhash = await connection.requestAirdrop(publicKey, amountLamports);

    console.log(`Airdrop successful. Transaction hash: ${txhash}`);
    return txhash;
  } catch (error) {
    console.error("Error during airdrop:", error);
    throw error;
  }
}

export async function getBalance(publicKey: string) {
  const connection = new Connection("https://api.devnet.solana.com");
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    console.log(`Balance of ${publicKey}: ${balance / 1e9} SOL`);
  } catch (error) {
    console.error(`Failed to get balance of account ${publicKey}:`, error);
  }
}

export async function transferSOL(options: { file: string; recipient: string; amount: string }): Promise<string> {
  try {
    const fileContent = await fs.promises.readFile(options.file, "utf-8");
    const keypairJson = JSON.parse(fileContent);

    if (!keypairJson.publicKey || !keypairJson.secretKey) {
      throw new Error("Invalid JSON file format. Public key or secret key not found.");
    }

    const senderKeypair = Keypair.fromSecretKey(new Uint8Array(keypairJson.secretKey));

    const connection = new Connection("https://api.devnet.solana.com");
    const recipientPublicKey = new PublicKey(options.recipient);

    const balance = await connection.getBalance(senderKeypair.publicKey);
    const amountLamports = parseFloat(options.amount) * 1e9;

    if (balance < amountLamports) {
      throw new Error(`Insufficient balance. Current balance: ${balance / 1e9} SOL, Attempted transfer: ${options.amount} SOL`);
    }

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: recipientPublicKey,
      lamports: amountLamports,
    });

    const transaction = new Transaction().add(transferInstruction);

    console.log(`Transferring ${options.amount} SOL from ${senderKeypair.publicKey.toBase58()} to ${recipientPublicKey.toBase58()}...`);
    const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

    console.log(`Transfer successful. Transaction signature: ${signature}`);
    return signature;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}