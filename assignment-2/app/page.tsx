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
  TOKEN_2022_PROGRAM_ID,
  MINT_SIZE,
  createTransferInstruction,
  createMintToCheckedInstruction,
  createBurnCheckedInstruction,
  createApproveInstruction
} from "@solana/spl-token";
import { useState } from 'react';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';

import { AppHero } from '@/components/ui';

export default function Page() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [delegateAddress, setDelegateAddress] = useState('');

  const handleCreateToken = async () => {
    if (!publicKey) {
      console.error("Wallet not connected");
      return;
    }
    console.log("Creating token...");
    const mint = Keypair.generate();
    const lamports_value = await getMinimumBalanceForRentExemptMint(connection);
    let tx = new Transaction();

    tx.add(
      // create mint account
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: lamports_value,
        space: MINT_SIZE,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      // init mint account
      createInitializeMintInstruction(
        mint.publicKey,
        8, // decimals
        publicKey, // mint authority
        publicKey // freeze authority
      )
    );

    console.log("Sending transaction...");

    try {

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      let tx2 = await signTransaction!(tx);
      console.log("tx2", tx2);
      console.log("tx", tx);
      const signature = await sendTransaction(
        tx2,
        connection,
        {signers: [mint, mint],}
      );
      await connection.confirmTransaction(signature, 'processed');

      console.log("Transaction signature:", signature);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const handleTransfer = async () => {
    if (!publicKey || !transferAmount || !recipient) {
      console.error("Wallet not connected or missing input fields");
      return;
    }

    if (!PublicKey.isOnCurve(new PublicKey(recipient))) {
      console.error("Invalid recipient address");
      return;
    }

    console.log("Transferring tokens...");

    const tx = new Transaction().add(
      createTransferInstruction(
        publicKey,
        PublicKey.default,
        new PublicKey(recipient), // recipient
        Number(transferAmount), // amount
        [],
        TOKEN_PROGRAM_ID
      )
    );

    try {
      const signature = await sendTransaction(
        tx,
        connection,
      );
      await connection.confirmTransaction(signature, 'processed');

      console.log("Transaction signature:", signature);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }

    console.log("Transfer completed");
  };

  const handleMint = async () => {
    if (!publicKey || !mintAmount) {
      console.error("Wallet not connected or missing input fields");
      return;
    }

    console.log("Minting tokens...");

    // Replace with the correct mint public key
    const mintPublicKey = new PublicKey('YOUR_MINT_PUBLIC_KEY_HERE');

    const tx = new Transaction().add(
      createMintToCheckedInstruction(
        mintPublicKey,
        publicKey, // recipient
        publicKey,
        Number(mintAmount),
        0 // Decimals
      )
    );

    try {
      const signature = await sendTransaction(
        tx,
        connection,
      );
      await connection.confirmTransaction(signature, 'processed');

      console.log("Transaction signature:", signature);
    } catch (error) {
      console.error("Error minting tokens:", error);
    }

    console.log("Minting completed");
  };

  const handleBurn = async () => {
    if (!publicKey || !burnAmount) {
      console.error("Wallet not connected or missing input fields");
      return;
    }

    console.log("Burning tokens...");

    // Replace with the correct mint public key
    const mintPublicKey = new PublicKey('YOUR_MINT_PUBLIC_KEY_HERE');

    const tx = new Transaction().add(
      createBurnCheckedInstruction(
        mintPublicKey,
        publicKey,
        publicKey,
        Number(burnAmount),
        0, // Decimals
      )
    );

    try {
      const signature = await sendTransaction(
        tx,
        connection,
      );
      await connection.confirmTransaction(signature, 'processed');

      console.log("Transaction signature:", signature);
    } catch (error) {
      console.error("Error burning tokens:", error);
    }

    console.log("Burning completed");
  };

  const handleDelegate = async () => {
    if (!publicKey || !delegateAddress) {
      console.error("Wallet not connected or missing input fields");
      return;
    }

    if (!PublicKey.isOnCurve(new PublicKey(delegateAddress))) {
      console.error("Invalid delegate address");
      return;
    }

    console.log("Delegating tokens...");

    // Replace with the correct mint public key
    const mintPublicKey = new PublicKey('YOUR_MINT_PUBLIC_KEY_HERE');

    // const tx = new Transaction().add(
    //   createApproveInstruction(
    //     mintPublicKey,
    //     new PublicKey(delegateAddress),
    //     publicKey,
    //     [],
    //     TOKEN_PROGRAM_ID
    //   )
    // );

    // try {
    //   const signature = await sendTransaction(
    //     tx,
    //     connection,
    //   );
    //   await connection.confirmTransaction(signature, 'processed');

    //   console.log("Transaction signature:", signature);
    // } catch (error) {
    //   console.error("Error delegating tokens:", error);
    // }

    console.log("Delegation completed");
  };

  const address = publicKey;
  if (!address) {
    return <div>No wallet connected</div>;
  }

  return (
    <div>
      <AppHero
        title="SPL Tokens"
        subtitle="Create and interact with tokens on Solana"
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
        <div className="my-4">
          <input
            type="text"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient Address"
            className="w-full px-3 py-2 border rounded-lg mt-2"
          />
          <button
            onClick={handleTransfer}
            className="w-full px-3 py-2 bg-green-500 text-white rounded-lg mt-2"
          >
            Transfer
          </button>
        </div>
        <div className="my-4">
          <input
            type="text"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            placeholder="Mint Amount"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <button
            onClick={handleMint}
            className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg mt-2"
          >
            Mint
          </button>
        </div>
        <div className="my-4">
          <input
            type="text"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            placeholder="Burn Amount"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <button
            onClick={handleBurn}
            className="w-full px-3 py-2 bg-red-500 text-white rounded-lg mt-2"
          >
            Burn
          </button>
        </div>
        <div className="my-4">
          <input
            type="text"
            value={delegateAddress}
            onChange={(e) => setDelegateAddress(e.target.value)}
            placeholder="Delegate Address"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <button
            onClick={handleDelegate}
            className="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg mt-2"
          >
            Delegate
          </button>
        </div>
      </div>
    </div>
  );
}
