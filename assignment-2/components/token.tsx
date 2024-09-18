'use client';

import {
  clusterApiUrl,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from "@solana/spl-token";

import { useWallet, useConnection } from '@solana/wallet-adapter-react';

import { AppHero, ellipsify } from './ui';

export default function Page() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();

  const handleCreateToken = async () => {
    console.log("Creating token...");

    const mint = Keypair.generate();
    const lamports_value = await getMinimumBalanceForRentExemptMint(connection);
    console.log("lamports_value:", lamports_value);
    let tx = new Transaction();

    tx.add(
      // create mint account
      SystemProgram.createAccount({
        fromPubkey: publicKey!,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: lamports_value,
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        8, // decimals
        publicKey!, // mint authority
        publicKey // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      )
    );

    console.log("Sending transaction...");

    try {

      const signature = await sendTransaction(
        tx,
        connection,);
      await connection.confirmTransaction(signature, 'processed');

      console.log("Transaction signature:", signature);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const address = publicKey;
  if (!address) {
    return <div>Error loading account</div>;
  }

  return (
    <div>
      <AppHero
        title="TEST"
        subtitle="TEST"
      >
        <div className="my-4">
          <div>Account: {address.toBase58()}</div>
          <button
            onClick={handleCreateToken}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg"
          >
            Create New Token
          </button>
        </div>
      </AppHero>
      <div className="space-y-8">
      </div>
    </div>
  );
}
