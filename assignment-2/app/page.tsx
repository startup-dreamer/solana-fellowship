'use client';
import s from "./page.module.css";
import Image from "next/image";
import no_wallet from "../components/images/no_wallet.png";

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
        { signers: [mint, mint], }
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
    return <div className={s["no_wallet_div"]}>
      <div>
        <div className={s["no_wallet_div_child"]}>
          <Image src={no_wallet} alt="No Wallet" width={100} height={100} />
        </div>
          No wallet connected 
      </div>
    </div>;
  }

  // // temp code
  // let public_Key = new PublicKey("6VHv5m21srQtBTbFikgj8KAsGm323VZvR2LsUbsea2Sf");
  // const address = public_Key

  return (
    <div className={s["parent_page_layout"]}>
      <AppHero
        title="SPL Tokens"
        subtitle="Create and interact with tokens on Solana Create and interact with tokens on SolanaCreate and interact with tokens on Solana"
      >
        <div className="my-4">
          <div className={s["parent_page_account"]}>Account: {address.toBase58()}</div>
          <button
            onClick={handleCreateToken}
            className={s["create_token_button_main"]}
          >
            Create New Token
          </button>
        </div>
      </AppHero>
      <div className={s["input_holder_parent"]}>
        <div className={s["input_holder_child"]}>
          <h2>
            Enter the amount and recipient address
          </h2>
          <input
            type="text"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="Amount"
            className={s["input_child_main_text"]}
          />
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient Address"
            className={s["input_child_main_text_2"]}
          />
          <button
            onClick={handleTransfer}
            className={s["input_child_main_button"]}
            style={{ backgroundColor: "purple" }}
          >
            Transfer
          </button>
        </div>
        <div className={s["input_holder_child"]}>
          <h2>
            Enter the Mint Amount
          </h2>
          <input
            type="text"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            placeholder="Mint Amount"
            className={s["input_child_main_text"]}
          />
          <button
            onClick={handleMint}
            className={s["input_child_main_button"]}
            style={{ backgroundColor: "green" }}
          >
            Mint
          </button>
        </div>
        <div className={s["input_holder_child"]}>
          <h2>
            Enter the Burn Amount
          </h2>
          <input
            type="text"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            placeholder="Burn Amount"
            className={s["input_child_main_text"]}
          />
          <button
            onClick={handleBurn}
            className={s["input_child_main_button"]}
            style={{ backgroundColor: "red" }}
          >
            Burn
          </button>
        </div>
        <div className={s["input_holder_child"]}>
          <h2>
            Enter the Delegate Address
          </h2>
          <input
            type="text"
            value={delegateAddress}
            onChange={(e) => setDelegateAddress(e.target.value)}
            placeholder="Delegate Address"
            className={s["input_child_main_text"]}
          />
          <button
            onClick={handleDelegate}
            className={s["input_child_main_button"]}
            style={{ backgroundColor: "blue" }}
          >
            Delegate
          </button>
        </div>
      </div>
    </div>
  );
}
