import { Connection, Keypair, clusterApiUrl, PublicKey, Transaction } from "@solana/web3.js";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, Umi } from '@metaplex-foundation/umi';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Request, Response } from "express";
import { createPostResponse } from "@solana/actions";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import dotenv from 'dotenv';

dotenv.config();

export async function createResponsePayload(transaction: Transaction, keypair: Keypair): Promise<any> {
    return createPostResponse({
      fields: { transaction, message: "Claim Success" },
      signers: [keypair],
    });
}
  
export async function createResponsePayloadMerkleTree(transaction: Transaction, keypair: Keypair, merkleTreePublicKey: PublicKey): Promise<any> {
    return createPostResponse({
      fields: { transaction, message: `Merkle Tree Success` },
      signers: [keypair],
    });
  
  
}
  
export function validatedQueryParams(query: any): { toPubkey: PublicKey } {
    let toPubkey = Keypair.generate().publicKey;
    if (query.to) {
      try {
        toPubkey = new PublicKey(query.to);
      } catch (err) {
        throw new Error("Invalid input query parameter: to");
      }
    }
    return { toPubkey };
}
  
export function handleError(res: Response, err: unknown, status: number = 500): void {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(status).json({ error: message });
}
  

export function createUmiInstance(keypair: Keypair): Umi {
    return createUmi(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
      .use(mplTokenMetadata())
      .use(mplBubblegum())
      .use(keypairIdentity(fromWeb3JsKeypair(keypair)));
}

export const connection = new Connection(
  process.env.SOLANA_RPC_URL || 
  clusterApiUrl(process.env.SOLANA_NETWORK as "mainnet-beta" | "testnet" | "devnet" | undefined || "devnet"),
  "confirmed"
);
export const PORT = 8080;
export const BASE_URL = `http://localhost:${PORT}`;